import React from "react";

const ProductsList = ({ products, productsLoading, onStartEdit, onDeleteProduct }) => {
    if (productsLoading) {
        return <div className="text-center py-10 text-slate-600 font-semibold">იტვირთება პროდუქტები...</div>;
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold text-sm">
                        <th className="p-4">პროდუქტი</th>
                        <th className="p-4">ფასი</th>
                        <th className="p-4">ამტვირთავი (Seller)</th>
                        <th className="p-4 text-center">მოქმედება</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                    {products.map((product) => (
                        <tr key={product._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-medium text-slate-900">
                                {product.universal?.title || "უსახელო"}
                            </td>
                            <td className="p-4 font-bold text-cyan-600">
                                ${product.universal?.price || 0}
                            </td>
                            <td className="p-4 text-slate-500 font-medium">
                                {product.seller?.fullname || product.seller?.name || product.createdBy?.fullname || "Admin (System)"}
                            </td>
                            <td className="p-4 text-center space-x-2">
                                <button
                                    onClick={() => onStartEdit(product)}
                                    className="text-amber-600 hover:text-amber-700 font-semibold hover:underline cursor-pointer"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm("ნამდვილად გსურთ პროდუქტის წაშლა?")) {
                                            onDeleteProduct(product._id);
                                        }
                                    }}
                                    className="text-red-500 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductsList;