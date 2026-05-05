// Utils
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Models
const Payment = require("../models/payment.model");
const Product = require("../models/product.model");

// Controller for purchasing a product
const checkout = catchAsync(async (req, res, next) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError("Product not found!", 404));
    }

    if (product.universal.stock < quantity) {
        return next(new AppError("Insufficient stock!", 400));
    }

    const total = product.universal.price * quantity;

    const payment = await Payment.create({
        userId: req.user._id,
        productId,
        status: "success",
        quantity
    });

    product.universal.stock -= quantity;
    await product.save();

    res.status(200).json({
        status: "success",
        message: "Purchase successful!",
        data: {
            payment,
            total
        }
    });
});

// Controller to get all user payments
const getUserPayments = catchAsync(async (req, res, next) => {
    const payments = await Payment.find({ userId: req.user._id });

    res.status(200).json({
        status: "success",
        message: "User payments returned successfully!",
        data: {
            payments
        }
    });
});

module.exports = { checkout, getUserPayments };