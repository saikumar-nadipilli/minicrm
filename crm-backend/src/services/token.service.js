const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const assertTokenEnvironment = () => {
  const requiredVariables = [
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET"
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      throw new Error(`${variable} is missing from environment variables`);
    }
  }
};

const generateAccessToken = (user) => {
  assertTokenEnvironment();

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
    }
  );
};

const generateRefreshToken = (user) => {
  assertTokenEnvironment();

  return jwt.sign(
    {
      userId: user._id.toString(),
      tokenId: crypto.randomUUID()
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
    }
  );
};

const verifyRefreshToken = (token) => {
  assertTokenEnvironment();

  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken
};
