const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

const getUsers = catchAsync(async (req, res, next) => {

    const users = await User.find();

    return res.json({
        status: "success",
        data: users,
    });

})

const getUserById = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid user ID", 400));
    }

    const user = await User.findById(id);

    if (!user) return next(new AppError("User not found", 404));

    user.password = undefined;

    return res.json({
        status: "success",
        data: user,
    })

})

const deleteUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid user ID", 400));
    }

    const user = await User.findById(id);

    if (!user) return next(new AppError("User not found", 404));

    if (req.user.role !== "admin" && req.user._id.toString() !== user._id.toString()) {
        return next(new AppError("You are not authorized to delete this user", 403));
    }

    await User.findByIdAndDelete(id);

    return res.json({
        status: "success",
        message: "User deleted successfully",
    });
});
const updateUserById = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const { file } = req;
    const { fullname, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid user ID", 400));
    }

    if (!fullname || !password) {
        return next(new AppError("Fullname and password are required", 400));
    }

    const user = await User.findById(id);

    if (!user) return next(new AppError("User not found", 404));

    if (req.user._id.toString() !== user._id.toString()) {
        return next(new AppError("You are not authorized to update this user", 403));
    }

    user.fullname = fullname;
    user.password = password;
    user.avatar = file ? file.path : null;

    await user.save({ validateBeforeSave: true });

    return res.json({
        status: "success",
        data: user,
    });
});

const updateUserRole = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid user ID", 400));
    }

    if (!['user', 'seller', 'admin'].includes(role)) {
        return next(new AppError("Invalid role type", 400));
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
    
    if (!user) return next(new AppError("User not found", 404));

    return res.json({
        status: "success",
        data: user,
    });
});

module.exports = {
    getUsers,
    getUserById,
    deleteUserById,
    updateUserById,
    updateUserRole,
};