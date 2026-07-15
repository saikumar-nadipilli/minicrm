const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 10 minutes."
  }
});

module.exports = {
  loginRateLimiter
};
