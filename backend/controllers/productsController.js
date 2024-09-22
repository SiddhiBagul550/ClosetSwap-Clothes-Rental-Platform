const catchAsync = require("../utils/catchAsync");
const Product = require("./../models/productModel");
const { promisify } = require("util");
const user = require("./userController");

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
  const category = req.params.category;
  const sub_category = req.params.sub_category;

  // console.log(category);

  const products = await Product.find({
    category: category,
    sub_category: sub_category,
  });

  // const products = await product.find();
  // console.log(products);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProductsById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const product = await Product.findById(id);
  res.status(200).json({
    status: "success",
    results: product.length,
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runvalidators: true,
  });
  res.status(200).json({
    status: "Success",
    data: {
      product,
    },
  });
});
