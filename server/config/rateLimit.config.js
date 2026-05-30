const { rateLimit } = require('express-rate-limit');

const buildHandler = (message) => (req, res, next, options) =>
    res.status(options.statusCode).json({
        status: 'error',
        message,
        retryAfter: `${Math.ceil(options.windowMs / 60_000)} minutes`,
    });

const userAwareKey = (req) => req.user?.id ?? req.ip;

const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 500,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: (req) => req.originalUrl.startsWith('/api/payment/webhook'),
    handler: buildHandler('Too many requests — please try again later.'),
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    skipSuccessfulRequests: true,
    handler: buildHandler('Too many failed auth attempts — try again in 15 minutes.'),
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: buildHandler('API rate limit exceeded — please slow down.'),
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: buildHandler('Upload limit reached — wait before uploading more files.'),
});

const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: buildHandler('Too many payment requests — please try again later.'),
});

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 10,                // max 10 AI calls per minute per IP
  message: { error: "Too many requests, please slow down" },
});

module.exports = { globalLimiter, authLimiter, apiLimiter, uploadLimiter, paymentLimiter, aiRateLimiter };
