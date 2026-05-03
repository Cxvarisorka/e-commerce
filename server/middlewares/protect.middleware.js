const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    
    const token = req.cookies && req.cookies.jwt;

    if (!token) {
      return next(new AppError("We can't identify you. Please login.", 401));
    }

    
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findById(payload.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user; 
    next();
  } catch (err) {
    return next(new AppError("Authentication failed or token expired", 401));
  }
};

module.exports = protect;  


// 1) შექმენით protect შუამავალი ფუნქცია, რომელიც კითხულობს გამოგზავნილ ტოკენს req.cookies.jwt და შემდეგ ამოწმებს არის თუ არა ეს ტოკენი სწორი, პირველი უნდა წავიკითხოთ payload, jwt.verify(token), შემდეგ ვკუთხულობთ შენახულ მომხმარებლის id და ვეძებთ ბაზაში, თუ ვიპოვეთ ვცვლით მოთხოვნის ობიექტს req.user = user, და ბოლოს ვიძახებთ next ფუნქციას