const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sendMail = require('../utils/email');

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
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Middlewares
userSchema.pre('save', async function() {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Methods
userSchema.methods.comparePassword = async function(candidate) {
    return await bcrypt.compare(candidate, this.password);
};

// Method to send verification link in user email
userSchema.methods.sendVerificationLink = function() {
    const token = jwt.sign({ userId: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

    const link = `http://localhost:3000/api/auth/verify-account?token=${token}`;

    const html = `
        <h1>Verification Link</h1>
        <a href="${link}">Click here to verify your account!</a>
    `

    sendMail(this.email, "Verification Link", html);
};

// Model
const User = mongoose.model("User", userSchema);

module.exports = User;
