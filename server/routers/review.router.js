const express = require("express");
const { getReviews, getReviewById, createReview, deleteReviewById, updateReviewById } = require("../controllers/review.controller");
const { protect } = require("../middlewares/protect.middleware");
const validate = require("../middlewares/validate.middleware");
const { reviewSchema } = require("../validations/review.validation");

const reviewRouter = express.Router();

reviewRouter.get("/", getReviews);

reviewRouter.get("/:productId", getReviewById);

reviewRouter.post("/:productId", protect, validate(reviewSchema), createReview);

reviewRouter.delete("/:reviewId", protect, deleteReviewById);

reviewRouter.patch("/:reviewId", protect, validate(reviewSchema), updateReviewById);

module.exports = reviewRouter;