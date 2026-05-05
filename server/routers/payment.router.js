const express = require('express');
const { protect } = require('../middlewares/protect.middleware');
const { createCheckoutSession } = require('../controllers/payment.controller');

const paymentRouter = express.Router();

// Create session
paymentRouter.post('/checkout', protect, createCheckoutSession);

module.exports = paymentRouter;