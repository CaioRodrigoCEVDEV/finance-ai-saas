function getHealth(_request, response) {
  return response.json({
    status: 'ok',
    app: 'Finance AI API'
  });
}

module.exports = {
  getHealth
};
