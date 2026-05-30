const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User id is required"],
    },

    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true,
    },

    stripePaymentIntentId: {
        type: String,
        unique: true,
        sparse: true,
    },

    totalAmount: {
        type: Number,
        required: [true, "Total amount of products is requried"]
    },

    stripeCustomerId: { type: String },

    transferGroup: {
        type: String
    },

    platformCommission: {
        type: Number,
        required: [true, "Platform commission is required"],
        default: 0
    },

    sellerNetAmount: {
        type: Number,
        required: [true, "Seller net amount is required"],
        default: 0
    },

    sellerDistributions: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product ID is required for distribution"]
            },
            sellerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: [true, "Seller ID is required for distribution"]
            },
            sellerStripeAccountId: {
                type: String,
                required: [true, "Seller Stripe account ID is required for distribution"]
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required for distribution"]
            },
            itemTotal: {
                type: Number,
                required: [true, "Item total is required for distribution"]
            },
            commission: {
                type: Number,
                required: [true, "Commission is required for distribution"]
            },
            sellerAmount: {
                type: Number,
                required: [true, "Seller amount is required for distribution"]
            }
        }
    ],

    sellerTransfers: [
        {
            sellerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: [true, "Seller ID is required for transfer"]
            },
            stripeAccountId: {
                type: String,
                required: [true, "Seller Stripe account ID is required for transfer"]
            },
            amount: {
                type: Number,
                required: [true, "Transfer amount is required"]
            },
            stripeTransferId: {
                type: String,
                required: [true, "Stripe transfer ID is required"]
            },
            status: {
                type: String,
                enum: ["pending", "succeeded", "failed"],
                default: "pending"
            }
        }
    ],

    status: {
        type: String,
        required: [true, "Payment status is required"],
        enum: ["pending", "succeeded", "failed", "canceled"],
        default: "pending"
    },

    webhookProcessed: {type: Boolean, default: false}

}, { timestamps: true });

paymentSchema.index({status: 1});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;