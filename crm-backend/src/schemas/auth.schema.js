const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain a special character"
  );

const emptyParamsAndQuery = {
  params: z.object({}),
  query: z.object({})
};

const signupSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

      email: z
        .string()
        .trim()
        .email("Enter a valid email address")
        .transform((email) => email.toLowerCase()),

      password: passwordSchema
    })
    .strict("Unknown fields are not allowed"),

  ...emptyParamsAndQuery
});

const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .email("Enter a valid email address")
        .transform((email) => email.toLowerCase()),

      password: z
        .string()
        .min(1, "Password is required")
        .max(72, "Password cannot exceed 72 characters")
    })
    .strict("Unknown fields are not allowed"),

  ...emptyParamsAndQuery
});

module.exports = {
  signupSchema,
  loginSchema
};
