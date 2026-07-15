const Activity = require("../models/activity.model");
const Contact = require("../models/contact.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { createActivity } = require("../services/activity.service");

const listActivities = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const activities = await Activity.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: {
      activities
    }
  });
});

const recordEmailSent = asyncHandler(async (req, res) => {
  const { contactId, subject } = req.body;

  if (!contactId) {
    throw new ApiError(400, "Contact is required");
  }

  const contact = await Contact.findOne({
    _id: contactId,
    user: req.user.id
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  const activity = await createActivity({
    userId: req.user.id,
    actorName: req.user.name,
    type: "email_sent",
    targetName: contact.name,
    targetContact: contact._id,
    description: subject
      ? `Email sent to ${contact.email} about "${subject}".`
      : `Email sent to ${contact.email}.`
  });

  res.status(201).json({
    success: true,
    message: "Email activity recorded",
    data: {
      activity
    }
  });
});

const recordCallMade = asyncHandler(async (req, res) => {
  const { contactId, discussion } = req.body;

  if (!contactId) {
    throw new ApiError(400, "Contact is required");
  }

  const contact = await Contact.findOne({
    _id: contactId,
    user: req.user.id
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  const activity = await createActivity({
    userId: req.user.id,
    actorName: req.user.name,
    type: "call_made",
    targetName: contact.name,
    targetContact: contact._id,
    description: discussion
      ? `Call made to ${contact.phone || contact.name}. Discussion: ${discussion}`
      : `Call made to ${contact.phone || contact.name}.`
  });

  res.status(201).json({
    success: true,
    message: "Call activity recorded",
    data: {
      activity
    }
  });
});

module.exports = {
  listActivities,
  recordEmailSent,
  recordCallMade
};
