const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Message = require("../models/messageModel");
const Booking = require("../models/bookingModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// Messaging stays open on a request so the two sides can sort out details
// before the lender decides; it closes once the booking is no longer live.
const CHATTABLE_STATUSES = ["requested", "accepted"];

async function loadBookingForUser(bookingId, userId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) return { error: new AppError("No booking found with that id", 404) };
  if (booking.renter !== userId && booking.owner !== userId) {
    return { error: new AppError("You don't have access to this conversation", 403) };
  }
  return { booking };
}

/* Booking.product/renter/owner are plain id strings (see bookingController's
   attachListings/attachUsers), so thread listings are assembled by hand here too. */
async function attachThreadDetails(bookings, userId) {
  const productIds = [...new Set(bookings.map((b) => b.product))];
  const counterpartIds = [...new Set(bookings.map((b) => (b.renter === userId ? b.owner : b.renter)))];
  const bookingIds = bookings.map((b) => String(b._id));

  const [products, counterparts, lastMessages, unreadCounts] = await Promise.all([
    Product.find({ _id: { $in: productIds } }),
    User.find({ _id: { $in: counterpartIds } }).select("username"),
    Message.aggregate([
      { $match: { booking: { $in: bookingIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$booking", message: { $first: "$$ROOT" } } },
    ]),
    Message.aggregate([
      { $match: { booking: { $in: bookingIds }, recipient: userId, readAt: null } },
      { $group: { _id: "$booking", count: { $sum: 1 } } },
    ]),
  ]);

  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const counterpartMap = new Map(counterparts.map((u) => [String(u._id), u]));
  const lastMessageMap = new Map(lastMessages.map((m) => [m._id, m.message]));
  const unreadMap = new Map(unreadCounts.map((u) => [u._id, u.count]));

  return bookings
    .map((b) => {
      const id = String(b._id);
      const counterpartId = b.renter === userId ? b.owner : b.renter;
      return {
        booking: b,
        listing: productMap.get(b.product) || null,
        counterpart: counterpartMap.get(counterpartId) || null,
        lastMessage: lastMessageMap.get(id) || null,
        unreadCount: unreadMap.get(id) || 0,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessage ? a.lastMessage.createdAt : a.booking.createdAt;
      const bTime = b.lastMessage ? b.lastMessage.createdAt : b.booking.createdAt;
      return new Date(bTime) - new Date(aTime);
    });
}

exports.getThreads = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ $or: [{ renter: req.user.id }, { owner: req.user.id }] });
  const threads = await attachThreadDetails(bookings, req.user.id);
  res.status(200).json({ status: "success", results: threads.length, data: { threads } });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const { error, booking } = await loadBookingForUser(req.params.bookingId, req.user.id);
  if (error) return next(error);

  const messages = await Message.find({ booking: req.params.bookingId }).sort("createdAt");

  await Message.updateMany(
    { booking: req.params.bookingId, recipient: req.user.id, readAt: null },
    { readAt: new Date() }
  );

  res.status(200).json({ status: "success", results: messages.length, data: { booking, messages } });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { error, booking } = await loadBookingForUser(req.params.bookingId, req.user.id);
  if (error) return next(error);

  if (!CHATTABLE_STATUSES.includes(booking.status)) {
    return next(new AppError("This conversation is closed", 400));
  }

  const text = (req.body.text || "").trim();
  if (!text) return next(new AppError("Message can't be empty", 400));

  const recipient = booking.renter === req.user.id ? booking.owner : booking.renter;
  const message = await Message.create({
    booking: booking.id,
    sender: req.user.id,
    recipient,
    text,
  });

  res.status(201).json({ status: "success", data: { message } });
});
