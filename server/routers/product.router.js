const express = require('express');
const productRouter = express.Router();
const  {createProduct,getALLproduct,getProduct,updateProduct,deleteProduct} = require('../controllers/product.controller')
const protect =  require('../middlewares/protect.middleware');

// CREATE PRODUCT
productRouter.post('/', protect, createProduct);

// GET ALL PRODUCTS
productRouter.get('/', getALLproduct);

// GET SINGLE PRODUCT
productRouter.get('/:id', getProduct);

// UPDATE PRODUCT
productRouter.patch('/:id', protect, updateProduct);

// DELETE PRODUCT
productRouter.delete('/:id', protect, deleteProduct);

module.exports = productRouter;