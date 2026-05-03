const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

const protect = catchAsync(async (req, res, next) => {
    const { jwt: token } = req.cookies;

    if(!token) {
        return next(new AppError("Token is required!", 401));
    }

    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id);

    if(!user) {
        return next(new AppError("Token is invalid!", 400));
    }

    req.user = user;
    next();
});

// This middleware will check passed roles with user roles, if user role is not equal then it will return error
const allowedTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError("User is not authorized!", 401));
        }

        next();
    }
}

module.exports = { protect, allowedTo };