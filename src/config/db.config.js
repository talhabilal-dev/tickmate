import mongoose from "mongoose";
import ENV from "./env.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

export default connectDB;