const Payment = require("../models/payment.model");
const Product = require("../models/product.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const createCheckoutSession = catchAsync(async (req, res, next) => {

    const products = await Product.find({_id: {$in: req.body}});

    if (!products) {
        return next(new AppError("Products is not found", 404));
    }

    const line_items = products.map(product => (
        {
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
    ));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel"
    })

    const payment = await Payment.create({
        userId: req.user_id,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        metadata: {
            userId: req.user._id.toString() 
        },
        totalAmount: products.reduce((accumulator, item) => {
            return accumulator + (item.price * item.stock);
        }, 0),
        status: "pending"
    })
    

    return res.status(201).json({
        status: "success",
        data: { url: session.url, sessionId: session.id }
    })


})

const verifyCheckout = catchAsync(async (req, res, next) => {

    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
        return next(new AppError("Session not found", 404));
    }

    if (session.metadata?.userId !== req.user._id.toString()) {
        return next(new AppError("Unauthorize", 401));
    }

    const isSuccess = session.payment_status === "paid" || session.status === "complete";

    if (isSuccess) {
        await Payment.findOneAndUpdate({
            stripeSessionId: sessionId
        }, {
                status:               "succeeded",
                stripePaymentIntentId: session.payment_intent,
                stripeCustomerId:     session.customer,
        })
    }

    return res.json({
        status: "success",
        message: "Payment done succassefuly"
    })


})

const handleWebhook = (req, res) => {

    const signature = req.headers["stripe-signature"];

    let event;

    try {

        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )

    } catch(err) {
        console.log(err);
    }

    if (event.type !== "checkout.session.complete") {
        return res.status(200).json({recived: true});
    }

    const session = event.data.object

    await Payment.findOneAndUpdate({
        stripeSessionId: session.id, webhookProcessed: false
    }, {
        status: "succasse",
        stripePaymentIntentId: session.payment_intent,
        stripeCustomerId: session.customer,
        webhookProcessed: true,
    })


    return res.json({recived: true});

};

module.exports = {
    createCheckoutSession,
    verifyCheckout,
    handleWebhook
}