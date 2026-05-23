const express = require('express');
const { signup, signin, signout, verifyEmail } = require('../controllers/auth.controller');
const { authLimiter } = require('../config/rateLimit.config');

const authRouter = express.Router();

authRouter.post('/signup', authLimiter, signup);
authRouter.post('/signin', authLimiter, signin);
authRouter.post('/signout', signout);
authRouter.get('/verify-email', verifyEmail);

module.exports = authRouter;
