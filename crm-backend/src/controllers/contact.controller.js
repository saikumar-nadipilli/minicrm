const Contact = require("../models/contact.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { createActivity } = require("../services/activity.service");

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildContactQuery = (userId, { status, search }) => {
  const query = { user: userId };

  if (status) {
    query.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { company: searchRegex }
    ];
  }

  return query;
};

const listContacts = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.validated.query;
  const skip = (page - 1) * limit;
  const query = buildContactQuery(req.user.id, { status, search });

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Contact.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create({
    ...req.validated.body,
    user: req.user.id
  });

  await createActivity({
    userId: req.user.id,
    actorName: req.user.name,
    type: "contact_added",
    targetName: contact.name,
    targetContact: contact._id,
    description: `${contact.status} at ${contact.company || "Private Entity"}`
  });

  res.status(201).json({
    success: true,
    message: "Contact created successfully",
    data: {
      contact
    }
  });
});

const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.validated.params.id,
    user: req.user.id
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.status(200).json({
    success: true,
    data: {
      contact
    }
  });
});

const updateContact = asyncHandler(async (req, res) => {
  const existingContact = await Contact.findOne({
    _id: req.validated.params.id,
    user: req.user.id
  });

  if (!existingContact) {
    throw new ApiError(404, "Contact not found");
  }

  const contact = await Contact.findOneAndUpdate(
    {
      _id: req.validated.params.id,
      user: req.user.id
    },
    req.validated.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  const isNoteOnlyUpdate =
    Object.keys(req.validated.body).length === 1 &&
    Object.prototype.hasOwnProperty.call(req.validated.body, "notes");
  const newestNote = isNoteOnlyUpdate
    ? req.validated.body.notes.split("\n\n")[0]
    : undefined;

  await createActivity({
    userId: req.user.id,
    actorName: req.user.name,
    type: isNoteOnlyUpdate ? "note_added" : "status_changed",
    targetName: contact.name,
    targetContact: contact._id,
    statusFrom: existingContact.status,
    statusTo: contact.status,
    noteContent: newestNote,
    description: isNoteOnlyUpdate
      ? undefined
      : `Updated contact details for ${contact.name}.`
  });

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    data: {
      contact
    }
  });
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({
    _id: req.validated.params.id,
    user: req.user.id
  });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  await createActivity({
    userId: req.user.id,
    actorName: req.user.name,
    type: "meeting_cancelled",
    targetName: contact.name,
    targetContact: contact._id,
    description: `Removed contact ${contact.name} from global directories.`
  });

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully"
  });
});

module.exports = {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact
};
