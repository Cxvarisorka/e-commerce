// Modules
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    universal: {
        title: {
            type: String,
            required: [true, "Title is required"]
        },
        description: {
            type: String,
            required: [true, "Description is required"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"]
        },
        stock: {
            type: Number,
            default: 1
        },
        media: [
            {
                src: {
                    type: String,
                    required: [true, "Image is required!"]
                },

                alt: {
                    type: String,
                    required: [true, "Alt is required!"]
                }
            }
        ],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Caterogy is required!"]
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Seller ID is required!"]
        }
    },
    attributes: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
