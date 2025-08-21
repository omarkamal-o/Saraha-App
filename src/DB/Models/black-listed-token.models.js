import mongoose from "mongoose";

const BlackListedTokenSchema = new mongoose.Schema( {
    tokenId: {type: String , required: true , unique: true},
    expirationDate: {type: Date , required: true},
    // userId: {type: mongoose.Schema.Types.ObjectId , ref: "User" , required: true},
} )

const BlackListedToken = mongoose.model("BlackListedToken" , BlackListedTokenSchema);
export default BlackListedToken;