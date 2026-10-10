const jwt = require("jsonwebtoken");
const env = require("../config/env")

function createToken(user){
    const payload = {
        userId: user.id
    }

    return jwt.sign(payload,
    env.jwtSecret, 
    {expiresIn : "7d"}
    )
}

function verifyToken(token){
    return jwt.verify(token, env.jwtSecret);
}

module.exports = { createToken, verifyToken};