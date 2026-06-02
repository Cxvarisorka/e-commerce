import React, { createContext, useContext, useState } from "react";
import { fetchProductReviews, fetchCreateReview, fetchDeleteReview } from "../services/ReviewService";
import { fetchCreateComment, fetchDeleteComment } from "../services/CommentService";
import { toast } from "react-toastify";

const ProductDetailsContext = createContext();

export const ProductDetailsProvider = ({ children }) => {
    const [reviews, setReviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProductData = async (productId) => {
        try {
            setLoading(true);
            const reviewsData = await fetchProductReviews(productId);
            setReviews(reviewsData.data || reviewsData);
        } catch (err) {
            toast.error("couldn't fetch all data ");
        } finally {
            setLoading(false);
        }
    };

    const addReview = async (productId, rating, commentText) => {
        try {
            const newReview = await fetchCreateReview(productId, { rating, comment: commentText });
            setReviews((prev) => [...prev, newReview.data || newReview]);
            toast.success("review added!");
        } catch (err) {
            toast.error("review couldn't added ");
        }
    };

    const addComment = async (productId, text) => {
        try {
            const newComment = await fetchCreateComment(productId, { text });
            setComments((prev) => [...prev, newComment.data || newComment]);
            toast.success("comment added!");
        } catch (err) {
            toast.error("comment couldn't deleted");
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            await fetchDeleteReview(reviewId);
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
            toast.success("review deleted");
        } catch (err) {
            toast.error("couldn't deleted");
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await fetchDeleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            toast.success("comment deleted");
        } catch (err) {
            toast.error("comment couldn't deleted");
        }
    };

    return (
        <ProductDetailsContext.Provider value={{
            reviews, comments, setComments, loading, loadProductData, addReview, addComment, deleteReview, deleteComment
        }}>
            {children}
        </ProductDetailsContext.Provider>
    );
};

export const useProductDetails = () => useContext(ProductDetailsContext);