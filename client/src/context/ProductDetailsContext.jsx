import React, { createContext, useContext, useState } from "react";
import { fetchProductReviews, fetchCreateReview, fetchDeleteReview } from "../services/ReviewService";
import { fetchProductComments, fetchCreateComment, fetchDeleteComment } from "../services/CommentService";
import { toast } from "react-toastify";

const ProductDetailsContext = createContext();

export const ProductDetailsProvider = ({ children }) => {
    const [reviews, setReviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProductData = async (productId) => {
        try {
            setLoading(true);
            
            const [reviewsRes, commentsRes] = await Promise.all([
                fetchProductReviews(productId),
                fetchProductComments()
            ]);
            if (reviewsRes?.data?.review) {
                setReviews(reviewsRes.data.review);
            } else {
                setReviews([]);
            }

            const allComments = commentsRes?.data || [];
            const filteredComments = allComments.filter(
                (c) => (c.product?._id || c.product) === productId
            );
            setComments(filteredComments);

        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("couldn't fetch all data");
        } finally {
            setLoading(false);
        }
    };

    const addReview = async (productId, rating, commentText) => {
        try {
            const res = await fetchCreateReview(productId, { rating, comment: commentText });
            const createdReview = res?.data?.review;
            
            if (createdReview) {
                setReviews((prev) => [...prev, createdReview]);
                toast.success("review added!");
            }
        } catch (err) {
            console.error(err);
            toast.error("review couldn't added");
        }
    };

    const addComment = async (productId, text) => {
        try {
            const res = await fetchCreateComment(productId, { content: text });
            const createdComment = res?.data?.comment;
            
            if (createdComment) {
                setComments((prev) => [...prev, createdComment]);
                toast.success("comment added!");
            }
        } catch (err) {
            console.error(err);
            toast.error("comment couldn't added");
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