const express = require('express');
const { signup, signin, signout } = require('../controllers/auth.controller');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/signout', signout);

module.exports = authRouter;