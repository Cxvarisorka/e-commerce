// Models
const Category = require("../models/category.model");
const Product = require("../models/product.model");

// Utils
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Controller to get all products
const getProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        status: "success",
        message: "Products returned successfully!",
        data: {
            products
        }
    })
});

// Controller to create new product
const createProduct = catchAsync(async (req, res, next) => {
    const { categoryId } = req.params;
    const { title, description, price, stock } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
        return next(new AppError("Category not found!", 404));
    }
    
    const allowedAttributes = category.allowedAttributes;
    const attributes = Object.keys(req.body.attributes || {});

    const invalidAttributes = attributes.filter(prop => !allowedAttributes.includes(prop));

    if (invalidAttributes.length > 0) {
        return next(new AppError("You passed the wrong properties!", 400));
    }

    if (!category.isActive) {
        return next(new AppError("You cant create new product because this category is disable", 400));
    }

    const product = await Product.create({
        universal: {
            title,
            description,
            price,
            stock,
            category: categoryId,
            sellerId: req.user._id
        },
        attributes: req.body.attributes
    });

    res.status(201).json({
        status: "success",
        message: "Product created successfully!",
        data: {
            product
        }
    })
});

// Controller to delete product
const deleteProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError("Product not found!", 404));
    }

    if (product.universal.sellerId.toString() != req.user._id.toString() && req.user.role !== "admin") {
        return next(new AppError("You cant delete this product!", 401));
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
        status: "success",
        message: "Product deleted successfully!"
    })
});

// Controller to edit product
const editProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { title, description, price, stock } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError("Product not found!", 404));
    }

    if (product.universal.sellerId.toString() != req.user._id.toString()) {
        return next(new AppError("You cant edit this product!", 401));
    }

    if (title) product.universal.title = title;
    if (description) product.universal.description = description;
    if (price) product.universal.price = price;
    if (stock) product.universal.stock = stock;

    await product.save();

    res.status(200).json({
        status: "success",
        message: "Product edited successfully!",
        data: {
            product
        }
    })
});

module.exports = { getProducts, createProduct, deleteProduct, editProduct };
