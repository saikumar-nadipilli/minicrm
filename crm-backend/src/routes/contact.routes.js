const express = require("express");

const {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact
} = require("../controllers/contact.controller");

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createContactSchema,
  updateContactSchema,
  contactIdParamSchema,
  listContactsSchema
} = require("../schemas/contact.schema");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(validate(listContactsSchema), listContacts)
  .post(validate(createContactSchema), createContact);

router
  .route("/:id")
  .get(validate(contactIdParamSchema), getContact)
  .patch(validate(updateContactSchema), updateContact)
  .delete(validate(contactIdParamSchema), deleteContact);

module.exports = router;
