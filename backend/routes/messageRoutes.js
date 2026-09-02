const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const messageController = require("../controllers/messageController");

router.use(authController.protect, authController.requireEmailVerified);

router.get("/threads", messageController.getThreads);
router.get("/:bookingId", messageController.getMessages);
router.post("/:bookingId", messageController.sendMessage);

module.exports = router;
