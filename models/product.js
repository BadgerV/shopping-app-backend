const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 20,
  },
  description: {
    type: String,
    required: true,
    maxLength: 100,
  },
  rating: {
    type: Number,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  productImage: {
    type: Buffer,
    contentType: String,

    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
