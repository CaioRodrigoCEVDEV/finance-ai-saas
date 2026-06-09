function authMiddleware(_request, _response, next) {
  return next();
}

module.exports = authMiddleware;
