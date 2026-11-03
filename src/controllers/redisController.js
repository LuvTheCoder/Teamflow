const { redis, isRedisReady } = require("../config/redis");

// Temporary: checks that Redis can store and read a value
async function checkRedis(req, res) {
  if (!isRedisReady()) {
    return res.status(503).json({
      status: "error",
      message: "Redis is not connected",
    });
  }

  try {
    // Store a value that deletes itself after 10 seconds, then read it back
    await redis.set("redis-check", "it works", { ex: 10 });
    const value = await redis.get("redis-check");

    res.status(200).json({
      status: "ok",
      message: "Redis connected",
      value,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Redis command failed",
      details: error.message,
    });
  }
}

module.exports = { checkRedis };
