import React, { useEffect } from "react";
import { useParams } from "react-router";
import { ProductDetailsProvider, useProductDetails } from "../context/ProductDetailsContext.jsx";
import ReviewSection from "../components/UI/product/ReviewSection.jsx";
import CommentSection from "../components/UI/product/CommentSection.jsx";

const ProductContent = () => {
    const { productId } = useParams();
    const { loadProductData, loading } = useProductDetails();

    useEffect(() => {
        if (productId) {
            loadProductData(productId);
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 font-semibold text-slate-600">
                იტვირთება მონაცემები...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 rounded-3xl text-white shadow-lg mb-6">
                <h1 className="text-2xl font-bold">პროდუქტის დეტალური გვერდი</h1>
                <p className="opacity-80 text-sm mt-1">პროდუქტის ID: {productId}</p>
            </div>
         <ReviewSection productId={productId} />
            <CommentSection productId={productId} />
        </div>
    );
};

const ProductDetails = () => {
    return (
        <ProductDetailsProvider>
            <ProductContent />
        </ProductDetailsProvider>
    );
};

export default ProductDetails;