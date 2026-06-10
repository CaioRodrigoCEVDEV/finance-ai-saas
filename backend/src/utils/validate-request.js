const AppError = require('./app-error');

function validateRequest(schema) {
  return function validationMiddleware(request, _response, next) {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      return next(new AppError(message, 400));
    }

    request.body = result.data;
    return next();
  };
}

function validateParams(schema) {
  return function paramsMiddleware(request, _response, next) {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      return next(new AppError(message, 400));
    }

    request.params = result.data;
    return next();
  };
}

function validateQuery(schema) {
  return function queryMiddleware(request, _response, next) {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      return next(new AppError(message, 400));
    }

    request.query = result.data;
    return next();
  };
}

module.exports = {
  validateRequest,
  validateParams,
  validateQuery
};
