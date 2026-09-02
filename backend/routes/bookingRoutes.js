const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

router.get("/availability/:productId", bookingController.getAvailability);

router.use(authController.protect, authController.requireEmailVerified);

router.route("/").post(bookingController.createBooking);
router.get("/mine", bookingController.getMyBookings);
router.get("/received", bookingController.getReceivedBookings);
router.get("/:id", bookingController.getBooking);
router.patch("/:id/accept", bookingController.acceptBooking);
router.patch("/:id/decline", bookingController.declineBooking);
router.patch("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
