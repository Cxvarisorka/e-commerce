const express = require("express");
const { protect } = require("../middlewares/protect.middleware");
const { createCheckoutSession, verifyCheckout, handleWebhook } = require("../controllers/payment.controller");

const paymentRouter = express.Router();

paymentRouter.post("/checkout", protect, createCheckoutSession);
paymentRouter.get("/verify/:sessionId", protect, verifyCheckout);

paymentRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

module.exports = paymentRouter