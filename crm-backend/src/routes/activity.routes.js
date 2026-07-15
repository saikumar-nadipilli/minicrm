const express = require("express");

const {
  listActivities,
  recordEmailSent,
  recordCallMade
} = require("../controllers/activity.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", listActivities);
router.post("/email", recordEmailSent);
router.post("/call", recordCallMade);

module.exports = router;
