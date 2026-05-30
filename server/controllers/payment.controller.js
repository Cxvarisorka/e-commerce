// Models
const Payment = require('../models/payment.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

// Utils
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Stripe import
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);

// Create session
const createCheckoutSession = catchAsync(async (req, res, next) => {
    const { userOrder } = req.body;

    const productsIds = userOrder.map(p => p.id);

    const obj = userOrder.reduce((acc, cur) => {
        if (!Number.isInteger(cur.quantity) || cur.quantity <= 0) {
            return next(new AppError("Incorrect quantity!", 400));
        }

        acc[cur.id] = cur.quantity;

        return acc;
    }, {});

    const products = await Product.find({ _id: { $in: productsIds } });

    if(products.length == 0) {
        return next(new AppError("Products cant be found", 404));
    }

    const sellerIds = [...new Set(products.map(product => product.universal.sellerId.toString()))];
    const sellers = await User.find({ _id: { $in: sellerIds } }).select('stripeAccountId');
    const sellerMap = sellers.reduce((map, seller) => {
        map[seller._id.toString()] = seller;
        return map;
    }, {});

    const orderDistributions = [];

    for (const product of products) {
        const quantity = obj[product._id.toString()];
        const seller = sellerMap[product.universal.sellerId.toString()];

        if (!seller || !seller.stripeAccountId) {
            return next(new AppError("All sellers must have a Stripe account connected before checkout.", 400));
        }

        const itemTotal = product.universal.price * quantity;
        const commission = Number((itemTotal * 0.05).toFixed(2));
        const sellerAmount = Number((itemTotal - commission).toFixed(2));

        orderDistributions.push({
            productId: product._id,
            sellerId: product.universal.sellerId,
            sellerStripeAccountId: seller.stripeAccountId,
            quantity,
            itemTotal,
            commission,
            sellerAmount
        });
    }

    const totalAmount = orderDistributions.reduce((accumulator, item) => accumulator + item.itemTotal, 0);
    const platformCommission = orderDistributions.reduce((accumulator, item) => accumulator + item.commission, 0);
    const sellerNetAmount = Number((totalAmount - platformCommission).toFixed(2));
    const transferGroup = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
            quantity: obj[product._id.toString()]
        }
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        payment_intent_data: {
            transfer_group: transferGroup
        },
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
    });

    const payment = await Payment.create({
        userId: req.user._id,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        transferGroup,
        totalAmount,
        platformCommission,
        sellerNetAmount,
        sellerDistributions: orderDistributions,
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

// Controller to handle Webhook
const stripeWebhook = async (req, res, next) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent( req.body, signature, process.env.STRIPE_WEBHOOK_SECRET );
    } catch (err) {
        return next(new AppError(`Webhook error: ${err.message}`, 400));
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        if (session.payment_status !== "paid") return res.status(200).json({ received: true });

        const payment = await Payment.findOne({ stripeSessionId: session.id });

        if (!payment) {
            return res.status(200).json({ received: true });
        }

        payment.status = "succeeded";
        payment.stripePaymentIntentId = session.payment_intent;
        payment.webhookProcessed = true;

        const transfersBySeller = payment.sellerDistributions.reduce((acc, item) => {
            const key = item.sellerStripeAccountId;

            if (!acc[key]) {
                acc[key] = {
                    sellerId: item.sellerId,
                    stripeAccountId: item.sellerStripeAccountId,
                    amount: 0
                };
            }

            acc[key].amount += item.sellerAmount;
            return acc;
        }, {});

        payment.sellerTransfers = [];

        for (const transferData of Object.values(transfersBySeller)) {
            const transfer = await stripe.transfers.create({
                amount: Math.round(transferData.amount * 100),
                currency: "usd",
                destination: transferData.stripeAccountId,
                transfer_group: payment.transferGroup
            });

            payment.sellerTransfers.push({
                sellerId: transferData.sellerId,
                stripeAccountId: transferData.stripeAccountId,
                amount: transferData.amount,
                stripeTransferId: transfer.id,
                status: "succeeded"
            });
        }

        await payment.save();
    }

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;

        const sessionId = paymentIntent.payment_details?.order_reference;
        const payment = await Payment.findOne({ stripeSessionId: sessionId });

        if (!payment) {
            return res.status(200).json({ received: true });
        }

        payment.status = "failed";
        payment.stripePaymentIntentId = paymentIntent.id;
        payment.webhookProcessed = true;

        await payment.save();
    }

    res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, stripeWebhook };