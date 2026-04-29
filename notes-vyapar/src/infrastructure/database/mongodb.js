import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MongoDB connection string is not configured. Set MONGO_URI or MONGODB_URI.");
}

const globalMongoose = globalThis;

if (!globalMongoose.mongoose) {
  globalMongoose.mongoose = {
    conn: null,
    promise: null
  };
}

async function connectDB() {
  if (globalMongoose.mongoose.conn) {
    return globalMongoose.mongoose.conn;
  }

  if (!globalMongoose.mongoose.promise) {
    globalMongoose.mongoose.promise = mongoose.connect(MONGO_URI).then((mongooseInstance) => {
      console.log("Connected to MongoDB");
      return mongooseInstance;
    });
  }

  globalMongoose.mongoose.conn = await globalMongoose.mongoose.promise;
  return globalMongoose.mongoose.conn;
}

export default connectDB;
