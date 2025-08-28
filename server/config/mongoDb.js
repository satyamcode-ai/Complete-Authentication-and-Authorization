import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });
    await mongoose.connect(process.env.MONGODB_URI);

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

export default connectDB;