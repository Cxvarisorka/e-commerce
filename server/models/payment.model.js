// Modules
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "User ID is required!"]
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product ID is required!"]
    },
    status: {
        type: String,
        enum: ["pending", "success", "denied"],
        default: "pending"
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;