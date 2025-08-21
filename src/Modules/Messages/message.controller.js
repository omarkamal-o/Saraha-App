import { Router } from "express";
import * as messagesServices from "./Services/message.services.js";

const router = Router();

router.post('/send-message/:receiverId' , messagesServices.sendMessageService);
router.get('/get-messages' , messagesServices.getMessagesService);

export default router;