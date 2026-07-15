require("dotenv").config();

const app = require("../src/app");
const connectDatabase = require("../src/config/database");

let databaseConnectionPromise;

const allowedOrigins = [
  "https://minicrm-k818.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
].map((origin) => origin.replace(/\/$/, ""));

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, "");

  return (
    allowedOrigins.includes(normalizedOrigin) ||
    /^https:\/\/minicrm-[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)
  );
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
};

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase();
  }

  await databaseConnectionPromise;

  return app(req, res);
};
