const express = require('express');
const { signup, signin, signout, verifyEmail } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/signout', signout);
authRouter.get('/verify-email', verifyEmail);

module.exports = authRouter;