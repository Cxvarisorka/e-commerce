const { rateLimit } = require('express-rate-limit')

// Strict limiter for auth routes (login, signup) — prevents brute force
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { error: 'Too many attempts, please try again after 15 minutes.' },
})

// Strict limiter for payment routes
const paymentLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { error: 'Too many payment requests, please slow down.' },
})

// General limiter for product/category browsing
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
})

module.exports = { authLimiter, paymentLimiter, generalLimiter }
