import express from "express";
import newcarembeddings from "../Services/newCarEmbeddingsController.js";
import usedcarembeddings from "../Services/usedCarEmbeddings.js";
const router = express.Router();
console.log("In embeddingsRoute.js");
router.get('/newcar',newcarembeddings);
router.get('/usedcar',usedcarembeddings);

export default router;