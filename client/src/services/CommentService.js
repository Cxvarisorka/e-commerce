import { api } from "../api/Axios";


export const fetchProductComments = async (productId) => {
    const res = await api.get(`/comments/${productId}`); 
    return res.data;
};

export const fetchCreateComment = async (productId, data) => {
    const res = await api.post(`/comments/${productId}`, data); 
    return res.data;
};

export const fetchDeleteComment = async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
};