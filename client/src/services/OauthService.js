import { api } from "../api/Axios"

export const getGoogleAuthLink = async () => {
    const res = await api.get("/auth/google"); 
    return res.data; 
};


export const handleGoogleCallback = async (searchParams) => {
    const res = await api.get(`/auth/google/callback${searchParams}`);
    return res.data;
};