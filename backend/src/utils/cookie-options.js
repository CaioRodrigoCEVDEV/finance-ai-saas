const env = require('../config/env');

function buildAuthCookieOptions() {
  const isProduction = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
    maxAge: isProduction
      ? 7 * 24 * 60 * 60 * 1000 // 7 days
      : undefined // session cookie in dev
  };
}

module.exports = {
  buildAuthCookieOptions
};
