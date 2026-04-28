const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Fullname is required!"]
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
    }
}, {
    timestamps: true
});

// Middlewares
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) next();
    this.password = await bcrypt.hash(this.password, 10);
});

// Methods
userSchema.methods.comparePassword = async function(candidate) {
    return await bcrypt.compare(candidate, this.password);
};

// Model
const User = mongoose.model("User", userSchema);

module.exports = User;

