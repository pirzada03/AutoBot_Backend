import { config} from "dotenv";
import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from 'openai';
import supa from "@supabase/supabase-js";
import { config as dotConfig } from "dotenv";
import router from "./Controllers/marketRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/",async (req,res)=>{
  return res.send("HELLO WORLD")
})

app.use("/",router);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
