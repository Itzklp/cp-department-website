const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: [true, "Please provide user name"],
        unique: true,
    },
    email:{
        type: String,
        required: [true, "Please provide email"],
        unique: true,
    },
    password:{
        type: String,
        required: [true, "Please provide password"],
    }
});