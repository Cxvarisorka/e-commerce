const Payment = require('../models/payment.model');
const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);

// Create session
const createCheckoutSession = catchAsync(async (req, res, next) => {
    const { productsIds } = req.body;

    const products = await Product.find({_id: {$in: productsIds} });

    if(products.length == 0) {
        return next(new AppError("Products cant be found", 404));
    }

    const line_items = products.map(product => {
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.universal.title,
                    description: product.universal.description
                },

                unit_amount: product.universal.price * 100,
            },
            quantity: 1
        }
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
    });

    const payment = await Payment.create({
        userId: req.user._id,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        totalAmount: products.reduce((accumulator, item) => {
            return accumulator + item.universal.price;
        }, 0),
        status: "pending"
    });

    res.status(201).json({
        status: "success",
        message: "Session created!",
        data: {
            payment,
            sessionUrl: session.url,
            sessionId: session.id
        }
    });
});

module.exports = { createCheckoutSession };