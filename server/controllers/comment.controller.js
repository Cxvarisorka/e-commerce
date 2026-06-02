const { default: mongoose } = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Product = require("../models/product.model");
const Comment = require('../models/comment.model')

const getComments = catchAsync(async (req, res, next) => {

    const comments = await Comment.find();

    return res.json({
        status: "succass",
        data: comments
    })


})

const getCommentById = catchAsync(async (req, res, next) => {

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return next(new AppError("Invlid comment id", 400));
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return next(new AppError("No comment found with this id", 404));
    }

    return res.json({
        status: "succass",
        data: comment
    })

})

const createComment = catchAsync(async (req, res, next) => {

    const { content } = req.body;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError("Invlid product id", 400));
    }

    if (!content) {
        return next(new AppError("Comment content is required", 400));
    }

    const comment = await Comment.create({
        user: req.user._id,
        product: req.params.productId,
        content
    })

    await Product.findByIdAndUpdate(productId, {
        $push: { comments: comment._id }
    })

    return res.status(201).json({
        status: "success",
        message: "Comment created successfully!",
        data: {
            comment
        }
    })


})

const deleteCommentById = catchAsync(async (req, res, next) => {

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return next(new AppError("Invlid comment id", 400));
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return next(new AppError("No comment found with this id", 404));
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not authorized to delete this comment", 401));
    }

    await Product.findByIdAndUpdate(comment.product, {
        $pull: { comments: comment._id }
    })

    await Comment.findByIdAndDelete(commentId);

    return res.json({
        status: "success",
        message: "Comment deleted successfully!"
    })
    


})

const updateCommentById = catchAsync(async (req, res, next) => {

    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return next(new AppError("Invlid comment id", 400));
    }

    if (!content) {
        return next(new AppError("Comment content is required", 400));
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return next(new AppError("No comment found with this id", 404));
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not authorized to update this comment", 401));
    }

    comment.content = content;

    await comment.save();

    return res.json({
        status: "success",
        message: "Comment updated successfully!",
    })


})

module.exports = { getComments, getCommentById, createComment, deleteCommentById, updateCommentById };