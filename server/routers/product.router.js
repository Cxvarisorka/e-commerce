// Modules
const express = require('express');

// Middlewares
const { protect, allowedTo } = require('../middlewares/protect.middleware');
const validate = require('../middlewares/validate.middleware');

// Controllers
const { getProducts, createProduct, editProduct, deleteProduct } = require('../controllers/product.controller');

// Configs
const upload = require('../config/upload.config');
const { uploadLimiter, aiRateLimiter } = require('../config/rateLimit.config');

// Validation
const { validationProductSchema } = require('../validations/product.validation');

const productRouter = express.Router();

// Get products
productRouter.get('/', getProducts);

// Create product
productRouter.post('/:categoryId', protect, allowedTo("admin", "seller"), uploadLimiter, aiRateLimiter, upload.array("images", 5), validate(validationProductSchema), createProduct);

// Delete product by id
productRouter.delete('/:productId', protect, allowedTo("admin", "seller"), deleteProduct);

// Edit product
productRouter.patch('/:productId', protect, uploadLimiter, upload.array("images", 5), validate(validationProductSchema), editProduct);

module.exports = productRouter;

