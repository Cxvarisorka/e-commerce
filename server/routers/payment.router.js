const express = require("express");
const { protect } = require("../middlewares/protect.middleware");
const { createCheckoutSession, verifyCheckout, handleWebhook } = require("../controllers/payment.controller");
const { paymentLimiter } = require("../config/rateLimit.config");

const paymentRouter = express.Router();

paymentRouter.post("/checkout", paymentLimiter, protect, createCheckoutSession);
paymentRouter.get("/verify/:sessionId", paymentLimiter, protect, verifyCheckout);

paymentRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

module.exports = paymentRouter