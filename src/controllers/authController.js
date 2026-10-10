const bcrypt = require("bcryptjs")
const {z} = require("zod")

const AppError = require("../utils/AppError")
const validate = require("../utils/validate")
const {createToken} = require("../utils/jwt")
const authService = require("../services/authService")

const registerSchema = z.object({
    name: z.string().trim().min(2, "must be at least 2 characters"),
    email : z.string().trim().toLowerCase().email("must be a valid email address"),
    password: z.string().min(8, "must be at least 8 characters")
});

const loginSchema = z.object({
    email : z.string().trim().toLowerCase().email("must be a valid email."),
    password : z.string().min(1, "is required")
});

// POST /api/auth/register

async function register(req, res){
    const {name, email, password} = validate(registerSchema, req.body);
    const existingUser = await authService.findUserByEmail(email);

    if(existingUser){
        throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authService.createUser(name, email, passwordHash);
    const token = createToken(user);

    res.status(201).json({
        status : "success",
        message : "User registered successfully [Special thanks to Luv Nichat]",
        data : {user, token},
    });

}

// POST /api/auth/login
async function login(req, res){
    const{email, password} = validate(loginSchema, req.body);
    const user = await authService.findUserByEmail(email);
    if(!user){
        throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
        throw new AppError("Invalid email or password", 401);
    }

    const token = createToken(user);

    res.status(200).json({
        status : "success",
        message : "Login Successfully",
        data : {
            user : {id : user.id, name :user.name, email:user.email},
            token,
        },
    });
}

// POST /api/auth/login
function logout(req, res){
    // The frontend deletes the token. Nothing to do on the server

    res.status(200).json({
        status:"success",
        message : "Logged out successfully",
        fun:"We hope u login"
    });
}

// GET /api/auth/me  (PROTECTED)
function getMe(req, res){
    res.status(200).json({
        status : "success",
        data : {user :req.user},
    });
}

module.exports = {register, login, logout, getMe};