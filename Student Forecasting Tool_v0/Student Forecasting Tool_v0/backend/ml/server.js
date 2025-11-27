require("dotenv").config();   // Load .env

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
}

connectDB();
