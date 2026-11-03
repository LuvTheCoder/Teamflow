const { Redis } = require("@upstash/redis");
const env = require("./env");

let redis = null;

if (!env.upstashRedisUrl || !env.upstashRedisToken) {
  console.warn("UPSTASH_REDIS_REST_URL / TOKEN not set. Running without Redis (no caching or rate limiting).");
} else {
  redis = new Redis({
    url: env.upstashRedisUrl,
    token: env.upstashRedisToken,
  });

  // Verify the connection is live on startup
  redis
    .ping()
    .then(() => console.log("Redis (Upstash) connected"))
    .catch((err) => console.error("Redis connection failed:", err.message));
}

// True only when Redis is configured
function isRedisReady() {
  return redis !== null;
}

module.exports = { redis, isRedisReady };
