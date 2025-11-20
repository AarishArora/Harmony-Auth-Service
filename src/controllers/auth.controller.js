import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";

export async function register(req, res) {
    const {email, fullname :{firstName, lastName}, password, role, userType } = req.body;
    
    // Support both 'role' and 'userType' from frontend, normalize to lowercase
    const userRole = (role || userType || "user").toLowerCase();

    const isUserAlreadyExists = await userModel.findOne({email});

    if(isUserAlreadyExists) {
        return res.status(400).json({message: "User already exists"});
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        email,
        password : hash,
        fullname: {
            firstName,
            lastName
        },
        role: userRole
    })


    const token = jwt.sign({
        id: user._id,
        role: user.role,
        fullname: user.fullname
    }, config.JWT_SECRET, {expiresIn: "2d"})

    await publishToQueue("user_created",{
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role
    })

    res.cookie("token", token);

    res.status(201).json({
        message: "User created succesfully",
        token,
        user: {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            role: user.role
        },
    })
}

export async function googleAuthCallback(req, res) {

    const redirectPath = req.session.redirect || "/";
    const user = req.user;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            {email: user.emails[0].value},
            {googleId: user.id}
        ]
    })

    if(isUserAlreadyExists) {

        const token = jwt.sign({
            id: isUserAlreadyExists._id,
            role: isUserAlreadyExists.role,
            fullname: isUserAlreadyExists.fullname
        },config.JWT_SECRET, {expiresIn: "2d"})

        res.cookie("token", token, { 
            httpOnly: false, 
            secure: true,
            sameSite: "none",
            maxAge: 2 * 24 * 60 * 60 * 1000 
        })

        // Pass token and user data as query parameters
        const userData = JSON.stringify({
            id: isUserAlreadyExists._id,
            email: isUserAlreadyExists.email,
            fullname: isUserAlreadyExists.fullname,
            role: isUserAlreadyExists.role
        });
        const encodedUserData = encodeURIComponent(userData);

        if(isUserAlreadyExists.role === "artist") {
            return res.redirect(`${config.FRONTEND_URL}${redirectPath}?token=${token}&user=${encodedUserData}`)
        }

        return res.redirect(`${config.FRONTEND_URL}${redirectPath}?token=${token}&user=${encodedUserData}`)
    }

    const newUser = await userModel.create({
        googleId: user.id,
        email: user.emails[0].value,
        fullname: {
            firstName: user.name.givenName,
            lastName: user.name.familyName
        }
    })

    await publishToQueue("user_created", {
        googleId: user.id,
        email: user.emails[0].value,
        fullname: {
            firstName: user.name.givenName,
            lastName: user.name.familyName
        }
    })

    const token = jwt.sign({
        id: newUser._id,
        role: newUser.role,
        fullname: newUser.fullname
    },config.JWT_SECRET, {expiresIn: "2d"})

    res.cookie("token", token, { 
        httpOnly: false, 
        secure: true,
        sameSite: "none",
        maxAge: 2 * 24 * 60 * 60 * 1000 
    })

    // Pass token and user data as query parameters
    const userData = JSON.stringify({
        id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        role: newUser.role
    });
    const encodedUserData = encodeURIComponent(userData);

    res.redirect(`${config.FRONTEND_URL}?token=${token}&user=${encodedUserData}`)

}

export async function login(req, res) {
    const {email, password} = req.body;

    const user = await userModel.findOne({email});

    if(!user) {
        return res.status(400).json({message: "Invalid email or password"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid email or password"});
    }

    const token = jwt.sign({
        id: user._id,
        role: user.role,
        fullname: user.fullname
    }, config.JWT_SECRET, {expiresIn: "2d"})

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        token,
        user: {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            role: user.role
        }
    })
}