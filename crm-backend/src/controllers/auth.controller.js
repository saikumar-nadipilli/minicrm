const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken
} = require("../services/token.service");

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth"
  };
};

const getClearCookieOptions = () => {
  const { maxAge, ...options } = getRefreshCookieOptions();
  return options;
};

const createSession = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie(
    "refreshToken",
    refreshToken,
    getRefreshCookieOptions()
  );

  return accessToken;
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;

  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists"
    );
  }

  const user = await User.create({
    name,
    email,
    password
  });

  const accessToken = await createSession(user, res);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: user.toJSON(),
      accessToken
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email }).select(
    "+password +refreshTokenHash"
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = await createSession(user, res);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toJSON(),
      accessToken
    }
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;

  if (!currentRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(currentRefreshToken);
  } catch (error) {
    res.clearCookie("refreshToken", getClearCookieOptions());

    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token has expired. Please log in again.");
    }

    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.userId).select(
    "+refreshTokenHash"
  );

  const suppliedTokenHash = hashToken(currentRefreshToken);

  if (
    !user ||
    !user.refreshTokenHash ||
    user.refreshTokenHash !== suppliedTokenHash
  ) {
    res.clearCookie("refreshToken", getClearCookieOptions());
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  const accessToken = await createSession(user, res);

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies.refreshToken;

  if (currentRefreshToken) {
    try {
      const decoded = verifyRefreshToken(currentRefreshToken);
      const user = await User.findById(decoded.userId).select(
        "+refreshTokenHash"
      );

      if (
        user &&
        user.refreshTokenHash === hashToken(currentRefreshToken)
      ) {
        user.refreshTokenHash = null;
        await user.save({ validateBeforeSave: false });
      }
    } catch {
      // An invalid or expired cookie should not prevent logout.
    }
  }

  res.clearCookie("refreshToken", getClearCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logout successful"
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser
};
