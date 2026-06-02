import React, { useState } from "react";
import { useProductDetails } from "../../../context/ProductDetailsContext";

const ReviewSection = ({ productId }) => {
    const { reviews, addReview, deleteReview } = useProductDetails();
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return;
        addReview(productId, rating, reviewText);
        setReviewText("");
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">⭐ მომხმარებელთა შეფასებები ({reviews.length})</h3>
            
      
            <form onSubmit={handleSubmit} className="mb-6 space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">აირჩიე რეიტინგი</label>
                    <select 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                    >
                        {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ვარსკვლავი</option>)}
                    </select>
                </div>
                <textarea
                    placeholder="დაწერე შენი შეფასება აი აქ..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                    required
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition cursor-pointer">
                    შეფასების გაგზავნა
                </button>
            </form>

            
            <div className="space-y-4">
                {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-amber-500 font-bold">⭐ {rev.rating}/5</span>
                                <span className="text-xs text-slate-400">-{rev.user?.fullname || "მომხმარებელი"}</span>
                            </div>
                            <p className="text-sm text-slate-700">{rev.comment}</p>
                        </div>
                        <button onClick={() => deleteReview(rev._id)} className="text-xs text-red-500 hover:underline cursor-pointer">წაშლა</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;