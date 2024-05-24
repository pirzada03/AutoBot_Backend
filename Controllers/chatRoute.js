//routes/chatRoute
import express from "express";
import  chatBot  from "../Services/chatController.js";

const router = express.Router();
router.use(express.json());
router.post('/chat',chatBot);

export default router;