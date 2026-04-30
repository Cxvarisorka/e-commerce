const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    }
});

// Create function to send verification link in user email
const sendMail = (to, subject, html) => {
    transporter.sendMail({
        to,
        subject,
        html
    })
};

module.exports = sendMail;