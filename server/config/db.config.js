const mongoose = require('mongoose');
const dns = require('dns/promises');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        const response = await mongoose.connect(process.env.MONGO_URI);

        console.log("DB connected succesfully!");
    } catch(err) {
        console.log(err);
    }
};

module.exports = connectDB;