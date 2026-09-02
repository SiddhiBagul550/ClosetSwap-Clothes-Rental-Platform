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
    enum: [
      // Women
      "Saree",
      "Lehenga",
      "Anarkali",
      "Kurta Set",
      "Indo-Western",
      "Gown",
      "Cocktail Dress",
      "Co-ord Set",
      // Men
      "Sherwani",
      "Bandhgala",
      "Nehru Jacket",
      "Dhoti Set",
      "Suit",
      "Blazer",
      // Kids
      "Lehenga Set",
      "Dhoti Kurta",
      "Tuxedo Set",
      "Birthday Outfit",
      // Cross-audience
      "Accessories",
      "Footwear",
      "Costumes",
    ], // Kept in sync by hand with frontend/wt-cp/src/constants/garmentTypes.js
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

  area: {
    type: String,
    enum: [
      "Akurdi",
      "Ambegaon",
      "Aundh",
      "Balewadi",
      "Baner",
      "Bavdhan",
      "Bhosari",
      "Bibwewadi",
      "Bopodi",
      "Camp",
      "Chandan Nagar",
      "Chikhli",
      "Chinchwad",
      "Dapodi",
      "Deccan Gymkhana",
      "Dhanori",
      "Dhayari",
      "Dighi",
      "Erandwane",
      "Fatima Nagar",
      "Hadapsar",
      "Handewadi",
      "Hinjewadi",
      "Kalas",
      "Kalyani Nagar",
      "Karve Nagar",
      "Kasarwadi",
      "Kasba Peth",
      "Katraj",
      "Keshav Nagar",
      "Khadki",
      "Kharadi",
      "Kiwale",
      "Kondhwa",
      "Koregaon Park",
      "Kothrud",
      "Lohegaon",
      "Magarpatta",
      "Manjri",
      "Market Yard",
      "Model Colony",
      "Mohammadwadi",
      "Moshi",
      "Mukund Nagar",
      "Nana Peth",
      "Narhe",
      "NIBM Road",
      "Nigdi",
      "Pashan",
      "Phugewadi",
      "Pimple Gurav",
      "Pimple Nilakh",
      "Pimple Saudagar",
      "Pimpri",
      "Punawale",
      "Rahatani",
      "Rasta Peth",
      "Ravet",
      "Sadashiv Peth",
      "Sangvi",
      "Shivajinagar",
      "Shukrawar Peth",
      "Sinhagad Road",
      "Somwar Peth",
      "Sus",
      "Swargate",
      "Talawade",
      "Tathawade",
      "Thergaon",
      "Tingre Nagar",
      "Undri",
      "Vadgaon Budruk",
      "Vadgaon Sheri",
      "Viman Nagar",
      "Vishrantwadi",
      "Wagholi",
      "Wakad",
      "Wanowrie",
      "Warje",
      "Yerwada",
    ], // Kept in sync by hand with frontend/wt-cp/src/constants/areas.js
    required: [true, "Please select the area"],
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

  delivery_option: {
    type: String,
    enum: ["courier", "handoff", "both"],
    required: [true, "Please select a delivery option"],
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // Owner-declared blackout ranges (e.g. in the wash, on loan elsewhere),
  // independent of and layered on top of whatever bookings already block.
  unavailableDates: {
    type: [
      {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
        _id: false,
      },
    ],
    default: [],
  },

});

const AllProducts = mongoose.model("AllProducts", productSchema);
module.exports = AllProducts;
