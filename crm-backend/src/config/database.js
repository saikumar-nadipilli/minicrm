const dns = require("dns");
const mongoose = require("mongoose");

// Work around local DNS (e.g. 127.0.0.1) failing SRV lookups for mongodb+srv://
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from the environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI);

  console.log(
    `MongoDB connected successfully: ${connection.connection.host}/${connection.connection.name}`
  );
};

module.exports = connectDatabase;
