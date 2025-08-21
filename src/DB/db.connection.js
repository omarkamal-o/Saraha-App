import mongoose from "mongoose";



const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_URL_LOCAL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed", error.message);
    }
}
export default dbConnection;