const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');

// Cookie sending
const createSendToken = (user, res, statusCode) => {
    const token = signToken(user);

    res.cookie('jwt', token, {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'dev' ? 'Lax' : 'Strict',
        secure: process.env.NODE_ENV === 'dev' ? false : true
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        message: "Succesfully returned cookie!",
        data: {
            user
        }
    });
}

// Sign token
const signToken = user => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
};

// Create account
const signup = catchAsync(async (req, res, next) => {
    const { fullname, email, password } = req.body;

    const user = await User.create({fullname, email, password});

    await user.sendVerificationLink();

    res.status(201).json({
        status: "success",
        message: "Account created succesfully!"
    });
});

// Signin account
const signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if user with email exsists
    const user = await User.findOne({email});

    // Return error
    if(!user) {
        return next(new AppError("Credentials is incorrect!", 400));
    }

    // Check is password is correct!
    const isCorrect = await user.comparePassword(password);

    if(!isCorrect) {
        return next(new AppError("Credentials is incorrect!", 400));
    }

    if (!user.isVerified) {
        return next(new AppError("Verify your email first!", 400));
    }

    createSendToken(user, res, 200);
});

// Signout
const signout = catchAsync(async (req, res, next) => {
    res.clearCookie('jwt');
    res.json({
        status: "success",
        message: "Succesfully signout!"
    });
});

// Controller to verify user email
const verify = catchAsync(async (req, res, next) => {
    const { token } = req.query;

    const payload = await jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
        return next(new AppError("We cant identify you!", 400));
    }

    const user = await User.findById(payload.userId);

    if (!user) {
        return next(new AppError("User not found!", 404));
    }

    user.isVerified = true;

    await user.save();

    res.status(200).send("<h1>Email successfully verified, you can go back!</h1>");
});

module.exports = { signup, signin, signout, verify };
