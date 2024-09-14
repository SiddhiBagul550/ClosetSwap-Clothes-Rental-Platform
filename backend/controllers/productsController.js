const catchAsync = require("../utils/catchAsync");
const product = require("./../models/productModel")
const { promisify } = require("util");
const user = require('./userController')


exports.newproduct_entry = catchAsync(async (req, res) => {
    const newproduct = await product.create({
        name: req.body.name,
        img: req.body.img,
        category: req.body.category,
        sub_category: req.body.sub_category,
        material: req.body.material,
        type: req.body.type,
        available_dates: req.body.available_dates,
        fit_type: req.body.fit_type,
        collar_styles: req.body.collar_styles,
        size: req.body.size,
        sleeve_style: req.body.sleeve_style,
        Brand: req.body.Brand,
        cost_per_Day: req.body.cost_per_Day,
    });

    

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

  console.log(category)

    const products = await product.find({
    category: category,
    sub_category: sub_category
});
   
    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  });
  

