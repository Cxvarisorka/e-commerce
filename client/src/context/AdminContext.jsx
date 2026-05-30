import { createContext, useContext, useState } from "react";
import { 
    fetchAllProducts, 
    fetchCreateProduct, 
    fetchUpdateProduct, 
    fetchDeleteProduct 
} from "../services/AdminService";
import { toast } from "react-toastify";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    const loadProducts = async () => {
        try {
            setProductsLoading(true);
            const res = await fetchAllProducts();
            if (res.data && res.data.data && Array.isArray(res.data.data.products)) {
                setProducts(res.data.data.products);
            } else {
                setProducts([]);
            }
        } catch (err) {
            toast.error("couldn't fetched products");
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const addProduct = async (categoryId, formData) => {
        try {
            const res = await fetchCreateProduct(categoryId, formData);
            const newProduct = res.data?.data?.product;

            console.log(res)
            
            if (newProduct) {
                setProducts((prev) => [...prev, newProduct]);
            } else {
                loadProducts(); 
            }
            toast.success("product added sucesfully");
            return true;
        } catch (err) {
            toast.error("product couldn't updated");
            return false;
        }
        
    };

    const updateProduct = async (id, formData) => {
        try {
            const res = await fetchUpdateProduct(id, formData);
            toast.success("product updated sucesfully");

            const updatedProduct = res.data?.data?.product;
            if (updatedProduct) {
                setProducts((prev) => prev.map((p) => p._id === id ? updatedProduct : p));
            } else {
                loadProducts(); 
            }
            return true;
        } catch (err) {
            toast.error("product couldn't updated");
            return false;
        }
    };

    const deleteProduct = async (id) => {
        try {
            await fetchDeleteProduct(id);
            toast.success("product deleted");
            setProducts((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            toast.error("product couldn't deleted");
        }
    };

    return (
        <AdminContext.Provider value={{ 
            products, 
            productsLoading, 
            loadProducts, 
            addProduct, 
            updateProduct, 
            deleteProduct 
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);