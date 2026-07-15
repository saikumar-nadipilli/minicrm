const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body || {},
      params: req.params || {},
      query: req.query || {}
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      return next(
        new ApiError(400, "Request validation failed", details)
      );
    }

    req.validated = result.data;
    next();
  };
};

module.exports = validate;
