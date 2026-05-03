const express = require("express");
const categoryRouter = express.Router();

const {createCategory,getAllCategories,getCategory,updateCategory,deleteCategory} =require('../controllers/category.controller')
const protect = require('../middlewares/protect.middleware');

// CREATE
categoryRouter.post('/', protect, createCategory);

// READ ALL
categoryRouter.get('/', protect, getAllCategories);

// READ ONE
categoryRouter.get('/:id', protect, getCategory);

// UPDATE
categoryRouter.patch('/:id', protect, updateCategory);

// DELETE
categoryRouter.delete('/:id', protect, deleteCategory);

module.exports = categoryRouter;