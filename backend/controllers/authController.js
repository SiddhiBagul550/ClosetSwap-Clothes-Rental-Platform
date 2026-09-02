const { promisify } = require("util");
const crypto = require("crypto");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendEmail, verificationEmail, passwordResetEmail } = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days converted into miliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  user.isAdmin = undefined; // select:false only hides these on queries, not on a freshly created/saved doc
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationSentAt = undefined;
  res.status(statusCode).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};

const deliverVerificationEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/?verify=${token}`;
  const { subject, html, text } = verificationEmail(link);
  await sendEmail({ to: user.email, subject, html, text });
};

exports.signup = catchAsync(async (req, res, next) => {
  const accountType = req.body.accountType === "shop" ? "shop" : "individual";

  if (!req.body.agreedToTerms) {
    return next(new AppError("You must agree to the Terms of Service and Privacy Policy", 400));
  }

  const newUser = await User.create({
    accountType,
    username: req.body.username,
    ownerName: accountType === "shop" ? req.body.ownerName : undefined,
    gstin: accountType === "shop" ? req.body.gstin : undefined,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    contactNumber: req.body.contactNumber,
    address: req.body.address,
    agreedToTermsAt: Date.now(),
  });

  const token = newUser.createEmailVerificationToken();
  newUser.emailVerificationSentAt = Date.now();
  await newUser.save({ validateBeforeSave: false });

  // Best-effort: a flaky email provider shouldn't fail the signup itself,
  // since nothing is gated on verification yet - the user can just resend.
  try {
    await deliverVerificationEmail(newUser, token);
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
  }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide your email and password", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("That verification link is invalid or has expired", 400));
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "Success", message: "Email verified." });
});

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+emailVerificationSentAt");

  if (user.emailVerified) {
    return next(new AppError("Your email is already verified.", 400));
  }

  if (user.emailVerificationSentAt) {
    const elapsed = Date.now() - user.emailVerificationSentAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return next(new AppError(`Please wait ${waitSeconds}s before requesting another email.`, 429));
    }
  }

  const token = user.createEmailVerificationToken();
  user.emailVerificationSentAt = Date.now();
  await user.save({ validateBeforeSave: false });
  await deliverVerificationEmail(user, token);

  res.status(200).json({ status: "Success", message: "Verification email sent." });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide your email", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  let code;

  if (user) {
    code = user.createPasswordResetCode();
    await user.save({ validateBeforeSave: false });
    const { subject, html, text } = passwordResetEmail(code);
    await sendEmail({ to: user.email, subject, html, text });
  }

  // Same response whether or not the email is registered, so this can't be used to enumerate accounts.
  res.status(200).json({
    status: "Success",
    message: "If that email is registered, a reset code has been sent.",
    // No Gmail credentials set yet - surfaced here in non-prod so the flow is testable without a real inbox.
    ...(process.env.NODE_ENV !== "production" && code && !process.env.GMAIL_USER ? { devResetCode: code } : {}),
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, code, password, passwordConfirm } = req.body;
  if (!email || !code || !password) {
    return next(new AppError("Please provide your email, the reset code, and a new password", 400));
  }

  const hashedCode = crypto.createHash("sha256").update(String(code)).digest("hex");

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("That reset code is invalid or has expired", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1. getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in please log in to get access.", 401)
    );
  }

  //2. verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  //4. check if user changed password after token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! please login again.", 401)
    );
  }

  req.user = currentUser;
  next();
});

// Runs after `protect`, so req.user is already set. Gates any feature beyond
// browsing (listing, booking, messaging, liking) behind a verified email.
exports.requireEmailVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(new AppError("Please verify your email before continuing.", 403));
  }
  next();
};

exports.restrictToAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+isAdmin");
  if (!user || !user.isAdmin) {
    return next(new AppError("You do not have permission to perform this action", 403));
  }
  next();
});

exports.verfiyCheck = catchAsync(async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      isAuth: false,
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return res.status(200).json({ isAuth: true });
});
