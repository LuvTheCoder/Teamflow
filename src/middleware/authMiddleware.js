const AppError = require("../utils/AppError")
const {verifyToken} = require("../utils/jwt")
const authService = require("../services/authService")

async function protect(req, res, next){
    const header = req.headers.authorization;

    // Auth: Bearer <token>
    if(!header || !header.startsWith("Bearer ")){
        throw new AppError("Please log in the continue", 401);
    }

    const token = header.split(" ")[1];
    let payload;
    try{
        payload = verifyToken(token);
    }
    catch(err){
        throw new AppError("Invalid or expired token", 401);
    }

    const user = await authService.findUserById(payload.userId);
    if(!user){
        throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    next();
}

module.exports = {protect};