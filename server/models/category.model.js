// Modules
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required!"]
    },
    description: {
        type: String,
        required: [true, "Description is required!"]
    },
    // image: {
    //     src: {
    //         type: String,
    //         required: [true, "Image SRC is required!"]
    //     },
    //     alt: {
    //         type: String,
    //         required: [true, "Image alt is required!"]
    //     }
    // },
    parentCategory: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    allowedAttributes: {
        type: [String]
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
