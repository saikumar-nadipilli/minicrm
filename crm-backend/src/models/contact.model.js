const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"]
    },

    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company cannot exceed 100 characters"]
    },

    designation: {
      type: String,
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"]
    },

    status: {
      type: String,
      enum: ["Lead", "Prospect", "Customer"],
      default: "Lead"
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

contactSchema.index({ user: 1, createdAt: -1 });
contactSchema.index({ user: 1, status: 1 });
contactSchema.index({ user: 1, name: 1 });
contactSchema.index({ user: 1, email: 1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
