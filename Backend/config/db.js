//  THIS FILE HELPS TO CONNECT MONGODB TO DATABASE 

const mongoose = require("mongoose");
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected successfully ");

    } catch (error) {
        console.error("MongoDB Connection failed",error)
        process.exit(1)
    }
};

module.exports = connectDB;