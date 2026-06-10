const env = require('../config/env');

function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
    maxAge: env.nodeEnv === 'production'
      ? 7 * 24 * 60 * 60 * 1000 // 7 days
      : undefined // session cookie in dev
  };
}

module.exports = {
  buildAuthCookieOptions
};
