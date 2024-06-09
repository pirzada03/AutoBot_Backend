//routes/chatRoute
import express from "express";
import  newCarChatBot  from "../Services/newCarChatController.js";
import usedCarChatBot from "../Services/usedCarChatController.js";
const router = express.Router();
router.use(express.json());
router.post('/newcar/chat',newCarChatBot);
router.post('/usedcar/chat',usedCarChatBot);


export default router;