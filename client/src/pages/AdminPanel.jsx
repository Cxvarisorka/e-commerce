import { useEffect, useState } from "react";
import { fetchAllUsers, fetchUpdateUserRole, fetchDeleteUser } from "../services/AdminService";
import { useAdmin } from "../context/AdminContext";
import { toast } from "react-toastify";


import UsersTab from "../components/UI/admin/usersPage";
import ProductForm from "../components/UI/admin/ProductForm";
import ProductsList from "../components/UI/admin/ProductsList";

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
            clearForm();
            e.target.reset();
        }
    };

    const startEdit = (product) => {
        setIsEditing(product._id);
        setTitle(product.universal?.title || "");
        setPrice(product.universal?.price || "");
        setDescription(product.universal?.description || "");
    };

    const clearForm = () => {
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

            {activeTab === "users" && (
                <UsersTab 
                    users={users} 
                    usersLoading={usersLoading}
                    onRoleChange={handleRoleChange}
                    onDeleteUser={handleUserDelete}
                />
            )}


            {activeTab === "products" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <ProductForm 
                        isEditing={isEditing}
                        title={title}
                        setTitle={setTitle}
                        categoryId={categoryId}
                        setCategoryId={setCategoryId}
                        price={price}
                        setPrice={setPrice}
                        description={description}
                        setDescription={setDescription}
                        setImage={setImage}
                        onSubmit={handleProductSubmit}
                        onCancel={clearForm}
                    />

                    <div className="lg:col-span-2">
                        <ProductsList 
                            products={products}
                            productsLoading={productsLoading}
                            onStartEdit={startEdit}
                            onDeleteProduct={deleteProduct}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;