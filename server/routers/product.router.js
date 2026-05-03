const express = require('express');
const { protect, allowedTo } = require('../middlewares/protect.middleware');
const { getProducts, createProduct, editProduct, deleteProduct } = require('../controllers/product.controller');

const productRouter = express.Router();

// Get products
productRouter.get('/', getProducts);

// Create product
productRouter.post('/:categoryId', protect, allowedTo("admin", "seller"), createProduct);

// Delete product by id
productRouter.delete('/:productId',  protect, allowedTo("admin", "seller"), deleteProduct);

// Edit product
productRouter.patch('/:productId', protect, editProduct);

module.exports = productRouter;

