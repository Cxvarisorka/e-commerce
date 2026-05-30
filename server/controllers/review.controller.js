const { default: mongoose } = require("mongoose");
const Review = require("../models/review.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Product = require("../models/product.model");

const getReviews= catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    return res.json({
        status: "succass",
        data: {
            reviews
        }
    })
});

const getReviewById = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    // if (!mongoose.Types.ObjectId(productId)) {
    //     return next(new AppError("Invlid product id", 400));
    // }

    const review = await Review.findById(productId);

    if (!review) {
        return next(new AppError("No review found with this id", 404));
    }

    return res.json({
        status: "succass",
        data: {
            review
        }
    })
});

const createReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    // if (!mongoose.Types.ObjectId(productId)) {
    //     return next(new AppError("Invlid product id", 400));
    // }

    if (!rating || !comment) {
        return next(new AppError("Rating and comment are required", 400));
    }

    const review = await Review.create({
        user: req.user._id,
        product: req.params.productId,
        rating,
        comment
    })

    await Product.findByIdAndUpdate(productId, {
        $push: {reviews: review._id}
    })

    return res.status(201).json({
        status: "succass",
        message: "Review created successfully",
        data: {
            review
        }
    })
});

const deleteReviewById = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;

    // if (!mongoose.Types.ObjectId(reviewId)) {
    //     return next(new AppError("Invlid review id", 400));
    // }

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new AppError("No review found with this id", 404));
    }

    if (review.user.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not authorized to delete this review", 403));
    }

    await Product.findByIdAndUpdate(review.product, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    return res.json({
        status: "succass",
        message: "Review deleted successfully"
    });
});

const updateReviewById = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // if (!mongoose.Types.ObjectId(reviewId)) {
    //     return next(new AppError("Invlid review id", 400));
    // }

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new AppError("No review found with this id", 404));
    }

    if (review.user.toString() !== req.user._id.toString()) {
        return next(new AppError("You are not authorized to update this review", 403));
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    return res.json({
        status: "succass",
        message: "Review updated successfully",
        data: {
            review
        }
    });
});

module.exports = {
    getReviews,
    getReviewById,
    createReview,
    deleteReviewById,
    updateReviewById
}