const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("CRITICAL ERROR: MONGODB_URI environment variable is NOT set!");
    console.error("Please add MONGODB_URI in your Render Dashboard -> Environment!");
  }

  try {
    const targetUri =
      uri ||
      "mongodb+srv://rohitrajyadav6522_db_user:ZrNkh6MiBpAiKUQY@cluster0.1vbqrdr.mongodb.net/Ecommerce?retryWrites=true&w=majority";

    const conn = await mongoose.connect(targetUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Atlas Connected]: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);
    console.error(
      "CHECK: Did you add '0.0.0.0/0' (Allow Access from Anywhere) in MongoDB Atlas Network Access?"
    );
  }
};

module.exports = connectDB;
