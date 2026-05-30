const express = require("express");
const { getComments, getCommentById, createComment, deleteCommentById, updateCommentById } = require("../controllers/comment.controller");
const { protect } = require("../middlewares/protect.middleware");
const validate = require("../middlewares/validate.middleware");
const commentSchema = require("../validations/comment.validation");

const commentRouter = express.Router();

commentRouter.get("/", getComments);

commentRouter.get("/:commentId", getCommentById);

commentRouter.post("/:productId", protect, validate(commentSchema), createComment);

commentRouter.delete("/:commentId", protect, deleteCommentById);

commentRouter.patch("/:commentId", protect, validate(commentSchema), updateCommentById);

module.exports = commentRouter;