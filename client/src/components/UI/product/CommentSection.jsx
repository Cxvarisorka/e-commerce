import React, { useState } from "react";
import { useProductDetails } from "../../../context/ProductDetailsContext";

const CommentSection = ({ productId }) => {
    const { comments, addComment, deleteComment } = useProductDetails();
    const [commentText, setCommentText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        addComment(productId, commentText);
        setCommentText("");
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">💬 კითხვა-პასუხი / კომენტარები</h3>
            
            <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="დასვი კითხვა ან დატოვე კომენტარი..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                />
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition cursor-pointer">
                    გაგზავნა
                </button>
            </form>

            <div className="space-y-3">
    {comments.map((comm) => (
        <div key={comm._id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
                <p className="text-sm text-slate-800">{comm.content}</p> 
                <span className="text-[10px] text-slate-400">ავტორი: {comm.user?.fullname || "სტუმარი"}</span>
            </div>
            <button onClick={() => deleteComment(comm._id)} className="text-xs text-slate-400 hover:text-red-500 cursor-pointer">წაშლა</button>
        </div>
    ))}
</div>
        </div>
    );
};

export default CommentSection;