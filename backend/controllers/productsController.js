const catchAsync = require("../utils/catchAsync");
const product = require("./../models/productModel");
const user = require("./userController");

exports.createProduct = catchAsync(async (req, res) => {
  const newproduct = await product.create(req.body);
  res.status(201).json({
    status: "success, posted",
    data: {
      product: newproduct,
    },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await product.find();

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});
