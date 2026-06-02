import React, { useState, useEffect } from "react";
import { Link } from "react-router"; 
import { api } from "../api/Axios"; 

const Home = () => {
    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/product"); 
                const fetchedProducts = response.data?.data?.products || [];

                setProducts(fetchedProducts); 
                setLoading(false);
            } catch (err) {
                console.error("product fetch failed", err);
                setError("can't load products");
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 font-semibold text-slate-600">
                🔄 პროდუქტები იტვირთება...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto my-10 p-4 bg-red-50 text-red-700 rounded-xl text-center font-medium">
                 {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-bold text-slate-800">🛍️ ჩვენი პროდუქტები</h2>
                <p className="text-slate-500 text-sm mt-1">ბაზიდან რეალურ დროში წამოღებული პროდუქტები</p>
            </div>
            
            {products.length === 0 ? (
                <div className="text-center text-slate-500 py-10 font-medium">
                    პროდუქტები ჯერ არ არის ატვირთული 🤷‍♂️
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => {
                        const details = product.universal || {};
                        const productImage = details.images?.[0]?.src || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60";

                        return (
                            <div 
                                key={product._id} 
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-200"
                            >
                                <div className="h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
                                    <img 
                                        src={productImage} 
                                        alt={details.title || "პროდუქტი"} 
                                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                    />
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-base text-slate-800 line-clamp-2 min-h-[48px]">
                                            {details.title || "უსახელო პროდუქტი"} 
                                        </h3>
                                        <p className="text-cyan-600 font-bold text-lg mt-2">
                                            {details.price ? `${details.price} ₾` : "ფასი არაა მითითებული"}
                                        </p>
                                    </div>
                                    
                                    <Link 
                                        to={`/product/${product._id}`} 
                                        className="mt-5 block text-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl text-sm transition cursor-pointer shadow-sm"
                                    >
                                        დეტალების ნახვა
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Home;