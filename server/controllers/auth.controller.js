const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/email');



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
        message: "Successfully authenticated!",
        data: { user }
    });
};

// Sin token
const signToken = user => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

// Create account
const signup = catchAsync(async (req, res, next) => {
    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("User already exists!", 400));
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
        fullname,
        email,
        password,
        verificationCode
    });

    
    sendMail(
        email, 
        "Verify your account", 
        `Your verification code is: ${verificationCode}`
    );

    res.status(201).json({
        status: "success",
        message: "Account created! Please check your email for the verification code."
    });
});

// email verifrication
const verifyEmail = catchAsync(async (req, res, next) => {
    const { email, code } = req.body;

    if (!code || !email) {
        return next(new AppError("Email and verification code are required", 400));
    }

    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
        return next(new AppError("Invalid verification code or email", 400));
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    
    createSendToken(user, res, 200); 
});

// Signin account
const signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

      // Check if user with email exsists
    const user = await User.findOne({ email });

    // Return error
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError("Incorrect email or password!", 401));
    }

    //cheeck if user is verfied
    if (!user.isVerified) {
        return next(new AppError("Please verify your email first!", 401));
    }

    createSendToken(user, res, 200);
});

// SignOut
const signout = (req, res) => {
    res.clearCookie('jwt');
    res.json({ status: "success", message: "Logged out successfully!" });
};

module.exports = { signup, signin, signout, verifyEmail };