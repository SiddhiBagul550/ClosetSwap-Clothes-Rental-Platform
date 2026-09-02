const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Product = require("../models/productModel");

// Lets a logged-in user (via the frontend, right after login/app load) find out
// whether to show the admin section at all - only ever answers about the requester.
exports.checkAdmin = catchAsync(async (req, res) => {
  res.status(200).json({ status: "success", data: { isAdmin: req.user.accountType === "admin" } });
});

// Platform-wide numbers for the admin dashboard: how many shop and individual
// accounts exist, how many listings each of them has, and the overall listing
// count. Product.owner is a plain id string (not a ref - see productModel), so
// counts are grouped in JS the same way attachOwners does it for product cards.
exports.getOverview = catchAsync(async (req, res) => {
  const [shops, individuals, itemCounts, totalItems] = await Promise.all([
    User.find({ accountType: "shop" }).sort({ createdAt: -1 }),
    User.find({ accountType: "individual" }).sort({ createdAt: -1 }),
    Product.aggregate([{ $group: { _id: "$owner", itemCount: { $sum: 1 } } }]),
    Product.countDocuments(),
  ]);

  const countByOwner = new Map(itemCounts.map((c) => [c._id, c.itemCount]));
  const withItemCount = (users) =>
    users.map((u) => ({ ...u.toObject(), itemCount: countByOwner.get(String(u._id)) || 0 }));

  res.status(200).json({
    status: "success",
    data: {
      totals: { shops: shops.length, individuals: individuals.length, items: totalItems },
      shops: withItemCount(shops),
      individuals: withItemCount(individuals),
    },
  });
});

exports.listShops = catchAsync(async (req, res) => {
  const filter = { accountType: "shop" };
  if (["pending", "verified", "rejected"].includes(req.query.status)) {
    filter.verificationStatus = req.query.status;
  }

  const shops = await User.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: shops.length,
    data: { shops },
  });
});

const findShop = async (id, next) => {
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("No user found with that id", 404), null);
  }
  if (user.accountType !== "shop") {
    return next(new AppError("Only shop accounts can be verified", 400), null);
  }
  return user;
};

exports.verifyShop = catchAsync(async (req, res, next) => {
  const user = await findShop(req.params.id, next);
  if (!user) return;

  user.verificationStatus = "verified";
  user.rejectionReason = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success", data: { user } });
});

exports.rejectShop = catchAsync(async (req, res, next) => {
  const reason = (req.body.reason || "").trim();
  if (!reason) {
    return next(new AppError("Please provide a reason for rejecting this shop", 400));
  }

  const user = await findShop(req.params.id, next);
  if (!user) return;

  user.verificationStatus = "rejected";
  user.rejectionReason = reason;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success", data: { user } });
});

// Sends a previously verified or rejected shop back to pending, e.g. after a
// dispute or a re-submitted GSTIN, so it re-enters the review queue.
exports.revokeShop = catchAsync(async (req, res, next) => {
  const user = await findShop(req.params.id, next);
  if (!user) return;

  user.verificationStatus = "pending";
  user.rejectionReason = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: "success", data: { user } });
});
