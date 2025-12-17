const mongoose = require("mongoose");
require("dotenv").config();

const logger = require("./logger.js");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info("MongoDB Connected");
  } catch (err) {
    logger.error(`MongoDB Connection Failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
