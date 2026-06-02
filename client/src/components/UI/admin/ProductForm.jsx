const ProductForm = ({
    isEditing,
    title,
    setTitle,
    categoryId,
    setCategoryId,
    price,
    setPrice,
    description,
    setDescription,
    setImage,
    onSubmit,
    onCancel
}) => {
    return (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
                {isEditing ? "📝 პროდუქტის რედაქტირება" : "➕ ახალი პროდუქტის დამატება"}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">სათაური</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                    />
                </div>
                
                {!isEditing && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">კატეგორია</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                            required
                        >
                            <option value="6a15a65e33422249dd1d0e35">Electronics</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ფასი ($)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">აღწერა</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 h-20 resize-none"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">პროდუქტის სურათი</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
                        required={!isEditing} 
                    />
                </div>
                
                <div className="flex gap-2 pt-2">
                    <button
                        type="submit"
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-xl text-sm transition cursor-pointer"
                    >
                        {isEditing ? "განახლება" : "დამატება"}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
                        >
                            გაუქმება
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProductForm;