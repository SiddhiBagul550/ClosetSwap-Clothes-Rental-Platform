const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    booking: {
      type: String,
      required: [true, "Message needs a booking"],
    },

    sender: {
      type: String,
      required: [true, "Message needs a sender"],
    },

    recipient: {
      type: String,
      required: [true, "Message needs a recipient"],
    },

    text: {
      type: String,
      required: [true, "Message can't be empty"],
      trim: true,
      maxlength: [2000, "Message is too long"],
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ booking: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
