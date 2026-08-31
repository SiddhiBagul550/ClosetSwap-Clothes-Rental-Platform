const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: [true, "Booking needs a product"],
    },

    renter: {
      type: String,
      required: [true, "Booking needs a renter"],
    },

    owner: {
      type: String,
      required: [true, "Booking needs an owner"],
    },

    fromDate: {
      type: Date,
      required: [true, "Booking needs a pick-up date"],
    },

    toDate: {
      type: Date,
      required: [true, "Booking needs a return date"],
    },

    size: {
      type: String,
      required: [true, "Booking needs a size"],
    },

    handoff: {
      type: String,
      enum: ["Collect", "Courier"],
      required: [true, "Booking needs a handoff method"],
    },

    deliveryAddress: {
      type: String,
      required: [
        function () {
          return this.handoff === "Courier";
        },
        "Delivery address is required for courier handoff",
      ],
    },

    courierFee: {
      type: Number,
      default: 0,
    },

    deposit: {
      type: Number,
      default: 0,
    },

    rent: {
      type: Number,
      required: [true, "Booking needs a computed rent"],
    },

    total: {
      type: Number,
      required: [true, "Booking needs a computed total"],
    },

    status: {
      type: String,
      enum: ["requested", "accepted", "declined", "cancelled"],
      default: "requested",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
