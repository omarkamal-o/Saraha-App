import Messages from "../../../DB/Models/messages.model.js";
import User from "../../../DB/Models/user.model.js";


export const sendMessageService = async (req ,res) => {
    try {
        const {content} = req.body;
        const {receiverId} = req.params;

        const user = await User.findById(receiverId);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const message = new Messages({
            content,
            receiverId
        })

        await message.save();

        return res.status(201).json({message: "Message sent successfully" , message});

    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}

export const getMessagesService = async (req , res) => {
    try {
        const messages = await Messages.find().populate([
            {
                path: "receiverId",
                select: "firstName lastName"
            }
        ]);
        return res.status(200).json({message: "Messages fetched successfully" , messages});
    } catch (error) {
        return res.status(500).json({message: "Internal server error" , error: error.message});
    }
}