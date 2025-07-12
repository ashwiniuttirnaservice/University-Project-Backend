import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect("mongodb://localhost:27017/CodeDriftLMS");
  console.log("MongoDB Connected");
};

export default connectDB;
