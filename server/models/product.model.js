const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   title: String,

   slug: String,

   description: String,

   brand: String,

   price: Number,

   discount: Number,

   stock: Number,

   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
   },

   media: [],

   variants: [],

   attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
   },

   ratings: {},

   tags: [String],

   isFeatured: Boolean,

   isActive: Boolean
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;