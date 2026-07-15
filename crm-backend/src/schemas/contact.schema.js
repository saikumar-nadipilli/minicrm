const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const contactStatuses = ["Lead", "Prospect", "Customer"];

const emptyParams = {
  params: z.object({})
};

const emptyQuery = {
  query: z.object({})
};

const objectIdSchema = z
  .string()
  .regex(objectIdRegex, "Invalid contact ID");

const optionalTrimmedString = (max, message) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional();

const contactBodyFields = {
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((email) => email.toLowerCase())
    .optional(),

  phone: optionalTrimmedString(
    20,
    "Phone cannot exceed 20 characters"
  ),

  company: optionalTrimmedString(
    100,
    "Company cannot exceed 100 characters"
  ),

  designation: optionalTrimmedString(
    100,
    "Designation cannot exceed 100 characters"
  ),

  status: z.enum(contactStatuses).optional(),

  notes: optionalTrimmedString(
    2000,
    "Notes cannot exceed 2000 characters"
  )
};

const createContactSchema = z.object({
  body: z
    .object(contactBodyFields)
    .strict("Unknown fields are not allowed"),

  ...emptyParams,
  ...emptyQuery
});

const updateContactSchema = z.object({
  body: z
    .object({
      ...contactBodyFields,
      name: contactBodyFields.name.optional()
    })
    .strict("Unknown fields are not allowed")
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field is required"
    }),

  params: z.object({
    id: objectIdSchema
  }),

  ...emptyQuery
});

const contactIdParamSchema = z.object({
  body: z.object({}).strict("Unknown fields are not allowed"),

  params: z.object({
    id: objectIdSchema
  }),

  ...emptyQuery
});

const listContactsSchema = z.object({
  body: z.object({}).strict("Unknown fields are not allowed"),

  ...emptyParams,

  query: z
    .object({
      page: z.coerce
        .number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .default(1),

      limit: z.coerce
        .number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),

      status: z.enum(contactStatuses).optional(),

      search: z
        .string()
        .trim()
        .optional()
    })
    .strict("Unknown query fields are not allowed")
});

module.exports = {
  createContactSchema,
  updateContactSchema,
  contactIdParamSchema,
  listContactsSchema
};
