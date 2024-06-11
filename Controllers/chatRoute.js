//routes/chatRoute
import express from "express";
import  newCarChatBot  from "../Services/newCarChatController.js";
import usedCarChatBot from "../Services/usedCarChatController.js";
import partsAndAccessoriesChatBot from "../Services/partsAndAccessoriesChatController.js"
const router = express.Router();
router.use(express.json());
router.post('/newcar/chat',newCarChatBot);
router.post('/usedcar/chat',usedCarChatBot);
router.post('/partsAndAccessories/chat',partsAndAccessoriesChatBot);


export default router;