import { config} from "dotenv";
import express from "express";
import cors from "cors";
import supa from "@supabase/supabase-js";
import { config as dotConfig } from "dotenv";
import router from "./Controllers/marketRoutes.js";
import chatBotRouter from "./Controllers/chatRoute.js";
import embeddingsRouter from "./Controllers/embeddingsRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/",async (req,res)=>{
  return res.send("HELLO WORLD")
})

app.use("/",router);
app.use("/chatBot",chatBotRouter);
app.use("/embeddings",embeddingsRouter);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
