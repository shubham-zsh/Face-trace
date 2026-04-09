import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import {JWT_EXPIRES_IN, JWT_SECRET} from '../config.js'

const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
};

const getPublicUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.password;
    return user;
};

export const signUp = async (req, res, next) =>{
    try{
        //create new user
        const {name , email ,password} = req.body;
        if(!name || !email || !password){
            const error = new Error('name, email and password are required');
            error.statusCode = 400;
            throw error;
        }

        //first find that user in databse
        const existingUser = await User.findOne({email})

        if(existingUser){
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // hash password never store password as plain text
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({name,email,password:hashedPassword});
        const token = jwt.sign({userId:newUser._id}, JWT_SECRET,{expiresIn: JWT_EXPIRES_IN})

        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success :true,
            message: 'user created successfully',
            data:{
                token,
                user:getPublicUser(newUser),
            }
        })
    }catch(error){
        next(error)
    }

}

export const signIn = async (req, res, next) =>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            const error = new Error('email and password are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({email}).select('+password');

        if(!user){
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({userId:user._id}, JWT_SECRET,{expiresIn: JWT_EXPIRES_IN});

        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success:true,
            message:'login successful',
            data:{
                token,
                user:getPublicUser(user)
            }
        });
    }catch(error){
        next(error)
    }

}

export const signOut = async (req, res, next) =>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: false
        });
        res.status(200).json({
            success:true,
            message:'logout successful'
        });
    }catch(error){
        next(error);
    }

}
