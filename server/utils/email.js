const nodemailer = require('nodemailer')

const transported = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth:{
    user: "55c7bde70f9beb",
    pass: "5dead5bcd8ccd1"
  }
})

const sendMail = async (to, subject, text) => {
  try {
    await transported.sendMail({
      from: '"My App" <support@sandbox.mailtrap.io>',
      to,
      subject,
      text
    });
  } catch (error) {
    console.log("Email error:", error); 
  }
};
module.exports = sendMail;