const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Product = require("./../models/productModel");
const User = require("../models/userModel");
const { promisify } = require("util");
const user = require("./userController");

// Only the listing's owner can PATCH these - `owner` itself is deliberately
// excluded so a PATCH body can't reassign a listing to someone else.
const UPDATABLE_FIELDS = [
  "name",
  "img",
  "category",
  "sub_category",
  "available_quantity",
  "size",
  "cost_per_day",
  "area",
  "product_description",
  "delivery_option",
  "isActive",
  "unavailableDates",
];

function pickUpdatableFields(body) {
  const update = {};
  UPDATABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) update[field] = body[field];
  });
  return update;
}

function validateUnavailableDates(ranges) {
  if (!Array.isArray(ranges)) return "unavailableDates must be a list of {from, to} ranges";
  for (const range of ranges) {
    if (!range || !range.from || !range.to) return "Each unavailable range needs a from and a to date";
    if (Number.isNaN(new Date(range.from).getTime()) || Number.isNaN(new Date(range.to).getTime())) {
      return "Each unavailable range needs valid dates";
    }
    if (new Date(range.from) >= new Date(range.to)) {
      return "Each unavailable range's from date must be before its to date";
    }
  }
  return null;
}

/* Product.owner is a plain id string (see productModel.owner), not a
   populated ref, so the shop-vs-individual label shown on product cards is
   attached by hand here — same convention as bookingController.attachUsers.

   address is only carried through for shop accounts: a shop's address is a
   public business location, but an individual's is their home, which stays
   hidden here (this endpoint is public/pre-booking) and is only ever sent
   once a booking with them is accepted (see bookingController.getMyBookings). */
async function attachOwners(products) {
  const ids = [...new Set(products.map((p) => p.owner))];
  const owners = await User.find({ _id: { $in: ids } }).select(
    "username accountType verificationStatus address"
  );
  const map = new Map(owners.map((u) => [String(u._id), u]));
  return products.map((p) => {
    const owner = map.get(p.owner) || null;
    const ownerInfo = owner && {
      username: owner.username,
      accountType: owner.accountType,
      verificationStatus: owner.verificationStatus,
      address: owner.accountType === "shop" ? owner.address : undefined,
    };
    return { ...p.toObject(), ownerInfo };
  });
}

exports.createProduct = catchAsync(async (req, res) => {
  const newproduct = await Product.create(req.body);

  res.status(201).json({
    status: "success, posted",
    data: {
      product: newproduct,
    },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const query = { ...req.query };
  // The public browse grid should hide disabled listings by default; an
  // owner looking up their own listings (?owner=id) still needs to see them
  // (e.g. to re-enable one), so the filter only kicks in when no owner is named.
  if (!query.owner && query.isActive === undefined) {
    query.isActive = true;
  }
  const products = await Product.find(query);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products: await attachOwners(products),
    },
  });
});

exports.getProductsById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findById(id);
  const [productWithOwner] = await attachOwners([product]);
  res.status(200).json({
    status: "success",
    results: product.length,
    data: {
      product: productWithOwner,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("No product found with that id", 404));
  if (product.owner !== req.user.id) {
    return next(new AppError("Only the owner can delete this listing", 403));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError("No product found with that id", 404));
  if (product.owner !== req.user.id) {
    return next(new AppError("Only the owner can edit this listing", 403));
  }

  const update = pickUpdatableFields(req.body);
  if (update.unavailableDates !== undefined) {
    const validationError = validateUnavailableDates(update.unavailableDates);
    if (validationError) return next(new AppError(validationError, 400));
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "Success",
    data: {
      product: updated,
    },
  });
});
