const mongoose = require("mongoose");
const validator = require("validator");
const bcrept = require("bcryptjs");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please tell us your name"],
  },

  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter your valid email"],
  },

  password: {
    type: String,
    required: [true, "Please entre your password"],
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

  contactNumber: {
    type: String,
    required: [true, "Please enter contact number"],
    minlength: 10,
  },

  address: {
    type: String,
    require: [true, "Please enter your address"],
  },

  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrept.hash(this.password, 12);
  this.passwordConfirm = undefined;
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

const User = mongoose.model("User", userSchema);
module.exports = User;
