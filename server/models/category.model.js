const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name:{
    type:String,
    required: [true, "Name is required"]
  },
  slug: {
    type: String,
    unique: true,
  },
   parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },

  level: {
    type: Number,
    default: 0,
  },

  path: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
   image: String,

  isActive: {
    type: Boolean,
    default: true,
  },
},{timestamps: true});


const Category = mongoose.model('Category', categorySchema);
module.exports = Category;