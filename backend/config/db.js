const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected successfully :- ${mongoose.connection.host}`.green.bold);
    }
    catch (error) {
        console.log(`Error in DB connection ${error}`.red.bold);
    }
}

module.exports = connectDB;