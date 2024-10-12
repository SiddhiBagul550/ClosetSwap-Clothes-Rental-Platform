const mongoose = require("mongoose");
const validator = require("validator");

const materialsByCategory = {
  clothing: [
    "Cotton",
    "Wool",
    "Silk",
    "Linen",
    "Polyester",
    "Rayon",
    "Nylon",
    "Spandex",
    "Denim",
    "Velvet",
    "Leather",
  ],
  Accessories: [
    "Leather",
    "Metal",
    "Plastic",
    "Acrylic",
    "Glass",
    "Wood",
    "Rubber",
    "Silicone",
    "Beads",
    "Pearls",
    "Feathers",
  ],
  Footwear: [
    "Leather",
    "Suede",
    "Canvas",
    "Rubber",
    "Synthetic Leather",
    "Mesh",
    "Foam",
    "PVC",
    "Neoprene",
    "Textile",
  ],
  Costumes: [
    "Polyester",
    "Spandex",
    "Nylon",
    "Tulle",
    "Sequins",
    "Feathers",
    "Faux Fur",
    "Satin",
    "Velvet",
    "Lycra",
  ],
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "enter a valid name !"],
  },

  img: {
    type: String,
    required: false,
  },

  category: {
    type: String,
    enum: ["men", "women", "kids"],
    required: true,
  },

  sub_category: {
    type: String, // Ensure `type` is defined for category
    enum: ["clothing", "Accessories", "Footwear", "Costumes"], // Enum for categories
    required: [true, "Please select a category"],
  },
  material: {
    type: String, // Ensure `type` is defined for material
    required: [true, "Please enter material"],
    validate: {
      validator: function (value) {
        // Access the selected category
        const selectedCategory = this.sub_category;
        // Check if the material is valid for the selected category
        if (
          materialsByCategory[selectedCategory] &&
          materialsByCategory[selectedCategory].includes(value)
        ) {
          return true;
        }
        return false;
      },
      message: function (props) {
        // Error message when material is invalid for the selected category
        return `${props.value} is not a valid material for the selected category: ${this.sub_category}`;
      },
    },
    default: "other", // Default value if no material is provided
  },
  type: {
    type: String, // Ensure `type` is defined for type
    required: [true, "Please enter a type"],
  },

  available_dates: {
    type: String,
    required: false,
  },

  fit_type: {
    type: String,
    required: [true, "select a fit type"],
  },

  collar_styles: {
    type: String,
    required: [true, "select a collar style"],
  },

  size: {
    type: String,
    required: [true, "select a size "],
  },

  sleeve_style: {
    type: String,
    required: [true, "select a sleeve style"],
  },

  Brand: {
    type: String,
    required: [true, "select a brand name"],
  },

  cost_per_Day: {
    type: Number,
    required: [true, "Enter the cost"],
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "Value should be graetre than 0",
    },
  },
});

const AllProducts = mongoose.model("AllProducts", productSchema);
module.exports = AllProducts;
