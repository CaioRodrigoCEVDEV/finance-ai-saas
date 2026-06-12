const cors = require('cors');

const env = require('./env');

const allowedOrigins = [
  env.frontendUrl,
  ...(env.allowedOrigins || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
].filter(Boolean);

module.exports = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
  credentials: true
});
