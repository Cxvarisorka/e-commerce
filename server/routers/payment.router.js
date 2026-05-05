// Modules
const express = require('express');

// Controllers
const { checkout, getUserPayments } = require('../controllers/payment.controller');

// Middlewares
const { protect } = require('../middlewares/protect.middleware');

const router = express.Router();

// Route to purchase product
router.post('/checkout/:productId', protect, checkout);
// Route to get all user payments
router.get('/my-payments', protect, getUserPayments);

module.exports = router;