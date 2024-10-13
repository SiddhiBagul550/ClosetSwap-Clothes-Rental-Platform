const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    contactNumber: req.body.contactNumber,
    address: req.body.address,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if email and password exits
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //check if user exist and password is correct
  const user = await User.findOne({ email: email }).select("+password");
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError("Incorrect eamil or password", 401));
  }

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

exports.verfiyCheck = catchAsync((req, res) => {
  console.log(req.cookies.jwt);
  // const token = req.cookies.jwt;

  // if (!token) {
  //   return res.status(401).json({
  //     isAuth: false,
  //   });
  // }

  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return res.status(200).json({ isAuth: true });
});
