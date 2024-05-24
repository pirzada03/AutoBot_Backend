import express from "express";
import embeddings, {vectorStore} from "../Services/embeddingsController.js";
const router = express.Router();
console.log("In embeddingsRoute.js");
router.get('/',embeddings);

export default router;