const mongoose = require("mongoose");
require("dotenv").config();

const dbLink = process.env.MONGO_URI;

const connectDB = async () => {
    try
    {
        const conn = await mongoose.connect(dbLink);

        console.log("MongoDB Connected!");
    }
    catch(err)
    {
        console.log("Error: ", err);
    }
};

module.exports = connectDB;