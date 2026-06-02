import { api } from "../api/Axios";

export const fetchProductReviews = async (productId) => {
    const res = await api.get(`/reviews/${productId}`); 
    return res.data;
};

export const fetchCreateReview = async (productId, data) => {
    const res = await api.post(`/reviews/${productId}`, data);
    return res.data;
};

export const fetchDeleteReview = async (reviewId) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
};