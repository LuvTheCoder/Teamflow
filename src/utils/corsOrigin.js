const env = require("../config/env");

function isAllowedOrigin(origin, callback) {
  // Allow requests with no origin (e.g. mobile native tools, curl, Postman)
  if (!origin) {
    return callback(null, true);
  }

  // Allow exact CLIENT_URL match (set this in Railway → Variables)
  if (env.clientUrl && origin === env.clientUrl) {
    return callback(null, true);
  }

  // Allow any *.vercel.app domain
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)) {
    return callback(null, true);
  }

  // Allow any *.onrender.com domain (Render.com frontend hosting)
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/.test(origin)) {
    return callback(null, true);
  }

  // Allow any *.netlify.app domain
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*netlify\.app$/.test(origin)) {
    return callback(null, true);
  }

  // Allow localhost & local Wi-Fi / LAN IP addresses on any port
  const isLocalLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
    origin
  );

  if (isLocalLan) {
    return callback(null, true);
  }

  console.warn(`CORS blocked for origin: ${origin}`);
  return callback(new Error(`CORS blocked for origin: ${origin}`));
}

module.exports = { isAllowedOrigin };
