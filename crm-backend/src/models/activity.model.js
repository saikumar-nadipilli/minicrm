const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
    },

    type: {
      type: String,
      enum: [
        "contact_added",
        "status_changed",
        "note_added",
        "meeting_cancelled",
        "call_made",
        "email_received",
        "email_sent"
      ],
      required: [true, "Activity type is required"]
    },

    actorName: {
      type: String,
      required: [true, "Actor name is required"],
      trim: true
    },

    actorInitials: {
      type: String,
      trim: true,
      maxlength: [4, "Actor initials cannot exceed 4 characters"]
    },

    targetName: {
      type: String,
      required: [true, "Target name is required"],
      trim: true
    },

    targetContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact"
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    statusFrom: {
      type: String,
      enum: ["Lead", "Prospect", "Customer", "Opportunity", "Inactive"]
    },

    statusTo: {
      type: String,
      enum: ["Lead", "Prospect", "Customer", "Opportunity", "Inactive"]
    },

    noteContent: {
      type: String,
      trim: true,
      maxlength: [2000, "Note content cannot exceed 2000 characters"]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
