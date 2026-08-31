const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const DAY_MS = 24 * 60 * 60 * 1000;
const COURIER_FEE = 120;
const ACTIVE_STATUSES = ["requested", "accepted"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function activeBookingsFor(productId) {
  return Booking.find({ product: productId, status: { $in: ACTIVE_STATUSES } });
}

/* Booking.product/renter/owner are plain id strings (matching the rest of
   this codebase's convention, e.g. productModel.owner) rather than populated
   refs, so listing/user details are attached by hand here. */
async function attachListings(bookings) {
  const ids = [...new Set(bookings.map((b) => b.product))];
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [String(p._id), p]));
  return bookings.map((b) => ({ ...b.toObject(), listing: map.get(b.product) || null }));
}

async function attachUsers(bookings, field, projection) {
  const ids = [...new Set(bookings.map((b) => b[field]))];
  const users = await User.find({ _id: { $in: ids } }).select(projection);
  const map = new Map(users.map((u) => [String(u._id), u]));
  return bookings.map((b) => ({ ...b, [`${field}Info`]: map.get(b[field]) || null }));
}

exports.getAvailability = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new AppError("No product found with that id", 404));

  const bookings = await activeBookingsFor(req.params.productId);
  res.status(200).json({
    status: "success",
    data: {
      units: Number(product.available_quantity) || 1,
      bookings: bookings.map((b) => ({ fromDate: b.fromDate, toDate: b.toDate, status: b.status })),
    },
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { productId, fromDate, toDate, size, handoff, deliveryAddress } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError("No product found with that id", 404));
  if (product.owner === req.user.id) return next(new AppError("You can't book your own listing", 400));

  if (!fromDate || !toDate) return next(new AppError("Pick a pick-up and a return day", 400));
  const from = startOfDay(new Date(`${String(fromDate).slice(0, 10)}T00:00:00`));
  const to = startOfDay(new Date(`${String(toDate).slice(0, 10)}T00:00:00`));
  if (!(from < to)) return next(new AppError("The return day must be after the pick-up day", 400));

  if (!size) return next(new AppError("Choose a size", 400));
  if (!["Collect", "Courier"].includes(handoff)) return next(new AppError("Choose how you'll get it", 400));
  if (handoff === "Courier" && (!deliveryAddress || deliveryAddress.trim().length < 15)) {
    return next(new AppError("Add your complete delivery address", 400));
  }

  const units = Number(product.available_quantity) || 1;
  const minDays = units === 1 ? 3 : 2;
  const nights = Math.round((to - from) / DAY_MS);
  if (nights < minDays) return next(new AppError(`This lender's minimum is ${minDays} days`, 400));

  const today = startOfDay(new Date());
  const leadDays = handoff === "Courier" ? 2 : 1;
  const minStart = addDays(today, leadDays);
  if (from < minStart) return next(new AppError("That pick-up date is too soon for this handover method", 400));

  const existing = await activeBookingsFor(productId);
  let overlapCount = 0;
  existing.forEach((b) => {
    let effectiveEnd = startOfDay(b.toDate);
    if (units === 1) effectiveEnd = addDays(effectiveEnd, 1); // cleaning turnaround day
    if (rangesOverlap(from, to, startOfDay(b.fromDate), effectiveEnd)) overlapCount++;
  });
  if (overlapCount >= units) {
    return next(new AppError("Those dates aren't available for this piece", 409));
  }

  const costPerDay = Number(product.cost_per_day) || 0;
  const rent = costPerDay * nights;
  const courierFee = handoff === "Courier" ? COURIER_FEE : 0;
  const deposit = 0;
  const total = rent + courierFee + deposit;

  const booking = await Booking.create({
    product: productId,
    renter: req.user.id,
    owner: product.owner,
    fromDate: from,
    toDate: to,
    size,
    handoff,
    deliveryAddress: handoff === "Courier" ? deliveryAddress : undefined,
    courierFee,
    deposit,
    rent,
    total,
    status: "requested",
  });

  res.status(201).json({ status: "success", data: { booking } });
});

exports.getMyBookings = catchAsync(async (req, res) => {
  const raw = await Booking.find({ renter: req.user.id }).sort("-createdAt");
  const withListings = await attachListings(raw);
  const bookings = await attachUsers(withListings, "owner", "username contactNumber address");
  res.status(200).json({ status: "success", results: bookings.length, data: { bookings } });
});

exports.getReceivedBookings = catchAsync(async (req, res) => {
  const raw = await Booking.find({ owner: req.user.id }).sort("-createdAt");
  const withListings = await attachListings(raw);
  const bookings = await attachUsers(withListings, "renter", "username");
  res.status(200).json({ status: "success", results: bookings.length, data: { bookings } });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("No booking found with that id", 404));
  if (booking.renter !== req.user.id && booking.owner !== req.user.id) {
    return next(new AppError("You don't have access to this booking", 403));
  }
  res.status(200).json({ status: "success", data: { booking } });
});

exports.acceptBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("No booking found with that id", 404));
  if (booking.owner !== req.user.id) return next(new AppError("Only the lender can accept this request", 403));
  if (booking.status !== "requested") return next(new AppError("This request has already been resolved", 400));
  booking.status = "accepted";
  await booking.save();
  res.status(200).json({ status: "success", data: { booking } });
});

exports.declineBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("No booking found with that id", 404));
  if (booking.owner !== req.user.id) return next(new AppError("Only the lender can decline this request", 403));
  if (booking.status !== "requested") return next(new AppError("This request has already been resolved", 400));
  booking.status = "declined";
  await booking.save();
  res.status(200).json({ status: "success", data: { booking } });
});

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("No booking found with that id", 404));
  if (booking.renter !== req.user.id) return next(new AppError("Only the renter can cancel this booking", 403));
  if (!ACTIVE_STATUSES.includes(booking.status)) {
    return next(new AppError("This booking can no longer be cancelled", 400));
  }
  booking.status = "cancelled";
  await booking.save();
  res.status(200).json({ status: "success", data: { booking } });
});
