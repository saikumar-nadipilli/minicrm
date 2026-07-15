const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const accessToken = authorization.split(" ")[1];

  if (!accessToken) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired");
    }

    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "The account linked to this token no longer exists");
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    name: user.name
  };

  next();
});

module.exports = {
  protect
};
