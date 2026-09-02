const mongoose = require("mongoose");
const validator = require("validator");
const bcrept = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  // "admin" is a distinct, non-self-serve role: it's never selectable at
  // signup (see authController.signup) and only ever set directly in the
  // database. Admin accounts don't rent, lend, or get verified - they exist
  // purely to run the admin panel, so they're excluded from the shop and
  // individual counts/listings everywhere in adminController.
  accountType: {
    type: String,
    enum: { values: ["individual", "shop", "admin"], message: "Account type must be individual, shop, or admin" },
    required: [true, "Please tell us if this is an individual or shop account"],
    default: "individual",
  },

  // Person's name for an individual account, shop's display/brand name for a shop account.
  username: {
    type: String,
    required: [true, "Please tell us your name"],
    trim: true,
  },

  // Shop-only: the proprietor's personal name, kept separate from the shop's public display name.
  ownerName: {
    type: String,
    trim: true,
    required: [
      function () {
        return this.accountType === "shop";
      },
      "Please enter the owner's name",
    ],
  },

  // Shop-only: GST/business registration number.
  gstin: {
    type: String,
    trim: true,
    uppercase: true,
    required: [
      function () {
        return this.accountType === "shop";
      },
      "Please enter a GSTIN or business registration number",
    ],
    validate: {
      validator: function (val) {
        if (this.accountType !== "shop") return true;
        return /^[0-9A-Z]{15}$/.test(val || "");
      },
      message: "Please enter a valid 15-character GSTIN",
    },
  },

  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (val) => validator.isEmail(val || ""),
      message: "Please enter a valid email",
    },
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  emailVerificationSentAt: { type: Date, select: false }, // throttles the "resend" button to once per 2 minutes

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: 8,
    select: false, // don't show in result
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not same",
    },
  },

  // Not used for login - just a contact point, and shown publicly on shop listings.
  contactNumber: {
    type: String,
    required: [true, "Please enter your contact number"],
    unique: true,
    sparse: true, // legacy documents predating this field have no contactNumber
    trim: true,
    validate: {
      validator: (val) => validator.isMobilePhone(val || "", "en-IN"),
      message: "Please enter a valid 10-digit Indian mobile number",
    },
  },

  // Individual: the person's address. Shop: the shop's address (pickup/rental location).
  address: {
    type: String,
    required: [true, "Please enter your address"],
    trim: true,
  },

  // Individuals have nothing to verify; shop accounts start pending until an admin confirms the GSTIN.
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: function () {
      return this.accountType === "shop" ? "pending" : "verified";
    },
  },

  // Shop-only: set by an admin when rejecting a verification request, cleared on approval.
  rejectionReason: {
    type: String,
    trim: true,
  },

  agreedToTermsAt: {
    type: Date,
    required: [true, "You must agree to the Terms of Service and Privacy Policy"],
  },

  likeditems: {
    type: [String],
  },

  cartitems: {
    type: [String],
  },

  passwordChangedAt: Date,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrept.hash(this.password, 12);
  this.passwordConfirm = undefined;

  // Skip on account creation - only real password changes should invalidate existing tokens.
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrept.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  //false - no password changed after jwt token
  return false;
};

/* Generates a 6-digit reset code, stores its hash + a 10-minute expiry on the
   document, and returns the plaintext code so the caller can deliver it
   (currently: logged server-side, see authController.forgotPassword). */
userSchema.methods.createPasswordResetCode = function () {
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;

  this.passwordResetToken = crypto.createHash("sha256").update(code).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return code;
};

/* Generates a random verification token, stores its hash + a 24-hour expiry
   on the document, and returns the plaintext token so the caller can build
   the verification link (see authController.signup / resendVerification). */
userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
