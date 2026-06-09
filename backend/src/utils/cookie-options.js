const env = require('../config/env');

function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production'
  };
}

module.exports = {
  buildAuthCookieOptions
};
