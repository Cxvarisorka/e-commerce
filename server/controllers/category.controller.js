// Models
const Category = require("../models/category.model");

// utils
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Controller to get all categories
const getCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        status: "success",
        message: "Categories successfully returned!",
        data: {
            categories
        }
    })
});

// Controller to create new category
const createCategory = catchAsync(async (req, res, next) => {
    const { name, description, parentCategory, allowedAttributes } = req.body;

    if (req.user.role !== "admin") {
        return next(new AppError("You cant create new category!", 401));
    }

    const category = await Category.create({ name, description, parentCategory, allowedAttributes });

    res.status(201).json({
        status: "success",
        message: "Category created successfully!",
        data: {
            category
        }
    })
});

// Controller to delete category
const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (req.user.role !== "admin") {
        return next(new AppError("You cant delete this category!", 401));
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
        status: "success",
        message: "Category deleted successfully!"
    })
});

// Controller to edit category
const editCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, parentCategory, allowedAttributes, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
        return next(new AppError("Category not found!", 404));
    }

    if (req.user.role !== "admin") {
        return next(new AppError("You cant edit this category!", 401));
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (parentCategory) category.parentCategory = parentCategory;
    if (allowedAttributes) category.allowedAttributes = allowedAttributes;
    if (isActive) category.isActive = isActive;

    await category.save();

    res.status(200).json({
        status: "success",
        message: "Category edited successfully!",
        data: {
            category
        }
    })
});

module.exports = { getCategories, createCategory, deleteCategory, editCategory };

