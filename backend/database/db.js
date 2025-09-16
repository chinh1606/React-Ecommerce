require("dotenv").config();
const mongoose = require("mongoose");

exports.connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Thay đổi thời gian chờ
    });
    console.log("connected to DB");
  } catch (error) {
    console.log(error);
  }
};
