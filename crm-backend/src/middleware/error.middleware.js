const notFoundHandler = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;
  next(error);
};

const globalErrorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details;

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  if (error.code === 11000) {
    statusCode = 409;

    const duplicateField = Object.keys(error.keyValue || {})[0];

    message = duplicateField
      ? `${duplicateField} already exists`
      : "Resource already exists";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";
    details = Object.values(error.errors).map(
      (validationError) => validationError.message
    );
  }

  const response = {
    success: false,
    message
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
