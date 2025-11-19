import mongoose from "mongoose";
import config  from "../config/config.js";

async function connectDB() {
    try {
        console.log("Attempting to connect with URI:", config.MONGO_URI);
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to database successfully!");
        
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        console.error("Full error:", error);
    }
}

export default connectDB;