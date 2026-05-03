const express = require('express');
const { signup, signin, signout,verifyEmail } = require('../controllers/auth.controller');

const authRouter = express.Router();

//signUp
authRouter.post('/signup', signup);
//logIn
authRouter.post('/signin', signin);
//signOut
authRouter.post('/signout', signout);
//verify
authRouter.post('/verify',verifyEmail);

module.exports = authRouter;