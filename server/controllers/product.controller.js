const Product = require('../models/product.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');


// CREATE PRODUCT
const createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    data: product
  });
});


// GET ALL PRODUCTS
const getALLproduct = catchAsync(async (req, res, next) => {
  const products = await Product.find()
    .populate("category");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products
  });
});


// GET SINGLE PRODUCT
const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: product
  });
});


// UPDATE PRODUCT
const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: product
  });
});


// DELETE PRODUCT
const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null
  });
});


module.exports = {
  createProduct,
  getALLproduct,
  getProduct,
  updateProduct,
  deleteProduct
};