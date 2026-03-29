const dotenv = require("dotenv");

dotenv.config();

const connectDatabase = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set. Starting without a database connection.");
    return null;
  }

  console.log("Database configuration detected.");
  return databaseUrl;
};

module.exports = { connectDatabase };
