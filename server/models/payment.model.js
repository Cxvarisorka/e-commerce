const { default: mongoose } = require("mongoose");

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

    status: {
        type: String,
        required: [true, "Payment status is required"],
        enum: ["pending", "succeeded", "failed", "canceled"],
        default: "pending"
    },

    webhookProcessed: {type: Boolean, default: false}

})

// Indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ webhookProcessed: 1, status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;