const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

// Slow down brute-force / enumeration attempts against auth endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many attempts, please try again in a few minutes.",
  },
});

// A 6-digit code is brute-forceable a lot faster than a password, so this gets a tighter window.
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many attempts, please try again in a few minutes.",
  },
});

router.route("/signup").post(authLimiter, authController.signup);
router.route("/login").post(authLimiter, authController.login);
router.route("/forgot-password").post(resetLimiter, authController.forgotPassword);
router.route("/reset-password").post(resetLimiter, authController.resetPassword);
router.route("/verify-email/:token").post(authLimiter, authController.verifyEmail);
router.route("/resend-verification").post(authLimiter, authController.protect, authController.resendVerificationEmail);

router.route("/").get(authController.protect, userController.getAllUsers);
router.route("/:id").get(authController.protect, userController.getUser);

router.route("/verify").get(authController.verfiyCheck);
router.route("/like/:id").post(authController.protect, authController.requireEmailVerified, userController.Liked);
router.route("/cart/:id").post(authController.protect, authController.requireEmailVerified, userController.cart);
router
  .route("/:id/verify-shop")
  .patch(authController.protect, authController.restrictToAdmin, userController.verifyShop);

module.exports = router;
