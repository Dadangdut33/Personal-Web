import mongoose from "mongoose";

const connection = {
  isConnected: 0,
};

export const connectDB = async () => {
  if (connection.isConnected) {
    console.log("Using existing connection");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI!, {
      dbName: process.env.DB_NAME,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log("New connection");
  } catch (error) {
    console.log("Error connecting to database", error);
    throw new Error("Error connecting to database");
  }
};
