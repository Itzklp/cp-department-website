const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    await User.create({
      name: "Super Admin",
      email: "admin@dept.edu",
      password: "adminpassword",
      role: "admin",
      isFirstLogin: false
    });
    console.log("Admin User Created");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
createAdmin();