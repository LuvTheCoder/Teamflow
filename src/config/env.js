require("dotenv").config();

const env = {
    port: process.env.PORT || 5000,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.JWT_SECRET,
    upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
};

const required = ["supabaseUrl", "supabaseServiceKey", "jwtSecret"];
for(const key of required){
    if(!env[key]){
        console.error(`Missing environment variables for ${key}. Check env files :D`);
        process.exit(1);
    }
}

module.exports = env;