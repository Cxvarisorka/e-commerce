import { useEffect, useState } from "react";
import { fetchAllUsers, fetchUpdateUserRole, fetchDeleteUser } from "../services/AdminService";
import { useAdmin } from "../context/AdminContext";
import { toast } from "react-toastify";

import UsersPage from "../components/UI/admin/usersPage";

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState("users"); 
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    const { products, productsLoading, loadProducts, addProduct, updateProduct, deleteProduct } = useAdmin();
 
    const [isEditing, setIsEditing] = useState(null); 
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    
    
    const [categoryId, setCategoryId] = useState("6a15a65e33422249dd1d0e35"); 

   useEffect(() => {
        if (activeTab === "users") {
            const getUsers = async () => {
                try {
                    setUsersLoading(true);
                    const res = await fetchAllUsers();
                    setUsers(res.data.data || []);
                } catch (err) {
                    toast.error("couldn't fetch all user");
                } finally {
                    setUsersLoading(false);
                }
            };
            getUsers();
        } else if (activeTab === "products") {
            loadProducts(); 
        }
    }, [activeTab]);


    const handleRoleChange = async (userId, newRole) => {
        try {
            await fetchUpdateUserRole(userId, newRole);
            toast.success("role changed sucesfully");
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            toast.error("role couldn't changed  ");
        }
    };

    const handleUserDelete = async (userId) => {
        if (!window.confirm("are you sure to you want to delete this user?")) return;
        
        try {
            await fetchDeleteUser(userId);
            toast.success("user deleted ");
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            toast.error("user couldn't deleted");
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("title", title);
        formData.append("price", price);
        formData.append("description", description);
        
        if (image) formData.append("images", image); 

        let success;
        if (isEditing) {
            success = await updateProduct(isEditing, formData);
        } else {
            success = await addProduct(categoryId, formData);
        }

        if (success) {
            setTitle("");
            setPrice("");
            setDescription("");
            setImage(null);
            setIsEditing(null);
            e.target.reset();
        }
    };

    const startEdit = (product) => {
        setIsEditing(product._id);
        setTitle(product.universal?.title || "");
        setPrice(product.universal?.price || "");
        setDescription(product.universal?.description || "");
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setTitle("");
        setPrice("");
        setDescription("");
        setImage(null);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mt-10">
            <div className="flex gap-4 border-b border-slate-100 pb-4 mb-6">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        activeTab === "users" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    მომხმარებლები ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab("products")}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        activeTab === "products" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    პროდუქტები ({products.length})
                </button>
            </div>

            <UsersPage 
            onRoleChange = {handleRoleChange}
            onDeleteUser = {handleUserDelete}/>

            {activeTab === "products" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-fit">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            {isEditing ? "📝 პროდუქტის რედაქტირება" : "➕ ახალი პროდუქტის დამატება"}
                        </h3>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
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
                                        onClick={cancelEdit}
                                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition cursor-pointer"
                                    >
                                        გაუქმება
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2">
                        {productsLoading ? (
                            <div className="text-center py-10 text-slate-600 font-semibold">იტვირთება პროდუქტები...</div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold text-sm">
                                            <th className="p-4">პროდუქტი</th>
                                            <th className="p-4">ფასი</th>
                                            <th className="p-4">ამტვირთავი (Seller)</th> {/* პირობის ახალი სვეტი */}
                                            <th className="p-4 text-center">მოქმედება</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                                        {products.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4 font-medium text-slate-900">{product.universal?.title || "უსახელო"}</td>
                                                <td className="p-4 font-bold text-cyan-600">${product.universal?.price || 0}</td>
                                                
                                                
                                                <td className="p-4 text-slate-500 font-medium">
                                                    {product.seller?.fullname || product.seller?.name || product.createdBy?.fullname || "Admin (System)"}
                                                </td>

                                                <td className="p-4 text-center space-x-2">
                                                    <button
                                                        onClick={() => startEdit(product)}
                                                        className="text-amber-600 hover:text-amber-700 font-semibold hover:underline cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm("ნამდვილად გსურთ პროდუქტის წაშლა?")) {
                                                                deleteProduct(product._id);
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;