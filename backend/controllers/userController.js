const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("./../models/userModel");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Admin-only: mark a shop account's GSTIN as verified. No admin UI yet - call this route directly.
exports.verifyShop = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that id", 404));
  }
  if (user.accountType !== "shop") {
    return next(new AppError("Only shop accounts can be verified", 400));
  }

  user.verificationStatus = "verified";
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.Liked = catchAsync(async (req, res, next) => {
  // Add or remove liked product
  const userId = req.params.id;
  const productId = req.body.productId;

  try {
    // Use $pull to remove the product if it's liked, or $addToSet to add it
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedUser;
    console.log("--------------------------------------------1");
    console.log(user);

    if (user.likeditems.includes(productId)) {
      // Remove liked product
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { likeditems: productId } },
        { new: true } // Return the updated document
      );
    } else {
      // Add liked product
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { likeditems: productId } }, // $addToSet prevents duplicates
        { new: true } // Return the updated document
      );
    }

    // Send the response with the updated liked items
    return res.status(200).json({ likeditems: updatedUser.likeditems });
  } catch (error) {
    return next(error); // Pass error to the next middleware
  }
});

// Handle Cart Items
exports.cart = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const productId = req.body.productId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedUser;
    if (user.cartitems.includes(productId)) {
      // Remove product from cart
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { cartitems: productId } },
        { new: true } // Return the updated document
      );
    } else {
      // Add product to cart
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { cartitems: productId } }, // $addToSet prevents duplicates
        { new: true } // Return the updated document
      );
    }

    // Send the response with the updated cart items
    return res.status(200).json({ cartitems: updatedUser.cartitems });
  } catch (error) {
    return next(error); // Pass error to the next middleware
  }
});
