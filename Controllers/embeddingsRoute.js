import express from "express";
import newcarembeddings from "../Services/newCarEmbeddingsController.js";
import usedcarembeddings from "../Services/usedCarEmbeddings.js";
import partsandaccessoriesembeddings from "../Services/partsAndAccessoriesEmbeddings.js"
const router = express.Router();
console.log("In embeddingsRoute.js");
router.get('/newcar',newcarembeddings);
router.get('/usedcar',usedcarembeddings);
router.get('/partsAndAccessories',partsandaccessoriesembeddings);

export default router;