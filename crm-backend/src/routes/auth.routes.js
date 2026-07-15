const express = require("express");

const {
  signup,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser
} = require("../controllers/auth.controller");

const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const {
  loginRateLimiter
} = require("../middleware/rateLimit.middleware");

const {
  signupSchema,
  loginSchema
} = require("../schemas/auth.schema");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  login
);

router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", protect, getCurrentUser);

module.exports = router;
