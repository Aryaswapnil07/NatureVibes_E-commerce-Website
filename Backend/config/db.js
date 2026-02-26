//  THIS FILE HELPS TO CONNECT MONGODB TO DATABASE

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/NatureVibes`);
    console.log("MongoDB is connected successfully ");
  } catch (error) {
    console.error("MongoDB Connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
