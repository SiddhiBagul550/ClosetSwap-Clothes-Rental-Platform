const mongoose = require("mongoose");
const validator = require("validator");
const User = require("./userModel");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "enter a valid name !"],
  },

  img: {
    type: String,
    required: [true, "Please upload an image"],
  },

  category: {
    type: String,
    enum: ["men", "women", "kids"],
    required: [true, "Please select the category"],
  },

  sub_category: {
    type: String, // Ensure `type` is defined for category
    enum: ["Clothing", "Accessories", "Footwear", "Costumes"], // Enum for categories
    required: [true, "Please select the sub-category"],
  },

  available_quantity: {
    type: String,
    required: [true, "Enter the available quantity you are renting"],
  },

  size: {
    type: String,
    required: [true, "select a size "],
  },

  cost_per_day: {
    type: String,
    required: [true, "Enter the cost"],
    validate: {
      validator: function (val) {
        return Number(val) > 0;
      },
      message: "Value should be greater than 0",
    },
  },

  owner: {
    type: String,
    required: [true, "Need owner id"],
    validate: {
      validator: async function (val) {
        const user = await User.findById(val);

        if (!user) {
          return false;
        }
        return true;
      },
      message: "Invalid user",
    },
  },

  product_description: {
    type: String,
    required: [true, "Enter the product description"],
  },

});

const AllProducts = mongoose.model("AllProducts", productSchema);
module.exports = AllProducts;
