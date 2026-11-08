const env = require("../config/env");

function isAllowedOrigin(origin, callback) {
  // Allow requests with no origin (e.g. mobile native tools, curl)
  if (!origin) {
    return callback(null, true);
  }

  // Exact match with configured clientUrl
  if (origin === env.clientUrl) {
    return callback(null, true);
  }

  // Allow localhost & local Wi-Fi / LAN IP addresses on any port (e.g. http://192.168.0.105:5173)
  const isLocalLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
    origin
  );

  if (isLocalLan) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
}

module.exports = { isAllowedOrigin };

