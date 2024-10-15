const catchAsync = require("../utils/catchAsync");
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

exports.Liked = catchAsync(async (req, res, next) => {

  // Add or remove liked product
  const id = req.params.id;
  const productId = req.body.productId;

  try {
    const user = await User.findById(id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isLiked = user.likeditems.includes(productId);

    if (isLiked) {
      user.likeditems = user.likeditems.filter((id) => id.toString() !== productId);
    } else {
      user.likeditems.push(productId);
    }

    await user.save();
    res.status(200).json({ likeditems: user.likeditems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     user,
  //   },
  // });
});
