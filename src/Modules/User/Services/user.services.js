import { compareSync, hashSync } from "bcrypt";
import { customAlphabet } from "nanoid";
import User from "../../../DB/Models/user.model.js";
import { asymmetricEncryption, asymmetricDecryption } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Utils/send-email.utils.js";
import { generateToken, verifyToken } from "../../../Utils/token.utils.js";
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";
import BlackListedToken from "../../../DB/Models/black-listed-token.models.js";
const uniqueId = customAlphabet('0123456789', 5);


export const signUpServices = async (req , res) => {
    try {
        const {firstName , lastName , age , gender , email , password , phoneNumber} = req.body;
        const isEmailExist = await User.findOne({
            $or: [
                {email},
                {firstName , lastName}
            ]
        });
        if(isEmailExist){
            return res.status(400).json({message: "User already exists"})
        }   
        const encryptedPhoneNumber = asymmetricEncryption(phoneNumber);
        // console.log(`Encrypted phone number : ${encryptedPhoneNumber}`);

        // hash for password
        const hashedPassword = hashSync(password , +process.env.SALT_ROUNDS);
        const otp = uniqueId();
        const user = await User.create({firstName , lastName , age , gender , email , password: hashedPassword , phoneNumber: encryptedPhoneNumber , otps:  {confirmation: hashSync(otp , +process.env.SALT_ROUNDS)}});

        // send email 
        emitter.emit('sendEmail' , {
            to : email,
            subject : 'Confirmation Email',
            content : `
            <h1>Confirmation Email</h1>
            <p>Your OTP is ${otp}</p>
            `
        })
        return res.status(201).json({message: "User created successfully" , user});

    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const confirmEmailServices = async (req , res , next) => {
    try {
        const {otp , email} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return next(new Error("User not found" , {cause: 404}));
        }
        const isOtpValid = compareSync(otp , user.otps?.confirmation);
        if(!isOtpValid){
            return next(new Error("Invalid OTP" , {cause: 400}));
        }
        user.isConfirmed = true;
        user.otps.confirmation = undefined;
        await user.save();
        return res.status(200).json({message: "Email confirmed successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const signInServices = async (req , res ) => {
    try {
        const {email , password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const isPasswordValid = compareSync(password , user.password);
        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid password"});
        }

        const accessToken = generateToken(
            { _id: user._id , email: user.email},
            process.env.JWT_ACCESS_SECRET ,
            {expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN) ,
            jwtid: uuidv4()
            }
        )

        const refreshToken = generateToken(
            {_id: user._id , email: user.email},
            process.env.JWT_REFRESH_SECRET ,
            {
                expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN) ,
                jwtid: uuidv4()
            }
        )

        return res.status(200).json({message: "Sign in successfully" , accessToken , refreshToken});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const RefreshTokenServices = async (req, res) => {
    try {
        let {refreshtoken} = req.body;

        if (refreshtoken && refreshtoken.startsWith("Bearer ")) {
            refreshtoken = refreshtoken.split(" ")[1]; 
        }
        if(!refreshtoken){
            return res.status(401).json({message: "Refresh token is required"});
        }
        const decodedData = verifyToken(refreshtoken , process.env.JWT_REFRESH_SECRET);
        if(!decodedData){
            return res.status(401).json({message: "Invalid token"});
        }

        const accessToken = generateToken(
            {_id : decodedData._id , email : decodedData.email} ,
            process.env.JWT_ACCESS_SECRET ,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ,
                jwtid: uuidv4()
            }
        )
        return res.status(200).json({message: "Token refreshed successfully" , accessToken});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const UpdateAccountServices = async (req , res) => {
    try {
        const {_id} = req.loggedInUser;
        const {firstName , lastName , age , gender , phoneNumber , email} = req.body;
        const user = await User.findByIdAndUpdate(_id , {firstName , lastName , age , gender , phoneNumber , email} , {new: true});
        return res.status(200).json({message: "Account updated successfully" , user});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const UpdatePasswordService = async (req , res) => {
    try {
        const { _id , tokenId , expirationDate } = req.loggedInUser;
        const { currentPassword , newPassword , confirmPassword } = req.body;

        if(!currentPassword || !newPassword){
            return res.status(400).json({message: "Current and new passwords are required"});
        }
        if(confirmPassword !== undefined && newPassword !== confirmPassword){
            return res.status(400).json({message: "New password and confirmation do not match"});
        }

        const user = await User.findById(_id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const isCurrentPasswordValid = compareSync(currentPassword , user.password);
        if(!isCurrentPasswordValid){
            return res.status(400).json({message: "Current password is incorrect"});
        }

        const isSameAsOld = compareSync(newPassword , user.password);
        if(isSameAsOld){
            return res.status(400).json({message: "New password must be different from the old password"});
        }

        const hashedNewPassword = hashSync(newPassword , +process.env.SALT_ROUNDS);
        user.password = hashedNewPassword;
        await user.save();

        if(tokenId && expirationDate){
            await BlackListedToken.create({
                tokenId,
                expirationDate: new Date(expirationDate * 1000),
                userId: _id
            })
        }

        return res.status(200).json({message: "Password updated successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const DeleteAccountService = async (req , res) => {
    const {_id} = req.loggedInUser;
    // start session
    const session = await mongoose.startSession();
    req.session = session;
    // start transaction
    session.startTransaction();
    const user = await User.findByIdAndDelete(_id , {session});
    if(!user){
        return res.status(404).json({message: "User not found"});
    }

    if (typeof Messages !== 'undefined') {
        await Messages.deleteMany({receiverId: _id} , {session});
    }

    // commit transaction
    await session.commitTransaction();
    // end session
    session.endSession();
    return res.status(200).json({message: "User deleted successfully" , user});
}

export const ListUsersService = async (req ,res) => {
    try {
        let users = await User.find().populate("Messages");
        users = users.map((user) => {
            return {
                ...user._doc,
                phoneNumber: asymmetricDecryption(user.phoneNumber)
            }
        })
        return res.status(200).json({message: "Users listed successfully" , users});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const LogOutServices = async (req , res) => {
    try {
        const { tokenId , expirationDate , _id } = req.loggedInUser;
        

        const blackListedToken = await BlackListedToken.create({
            tokenId,
            expirationDate: new Date(expirationDate* 1000),
            userId: _id
        })
        return res.status(200).json({message: "User logged out successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}