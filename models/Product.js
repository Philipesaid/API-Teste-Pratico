const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: false,
    trim: true
  }
});

ProductSchema.plugin(timestamp);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
