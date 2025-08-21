import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},{
    timestamps: true
})

const Messages = mongoose.model("messages" , messageSchema);
export default Messages;