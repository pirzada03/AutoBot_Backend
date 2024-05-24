import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import supabaseClient from "../supabaseClient.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config as dotConfig } from "dotenv";
import supabase from "@supabase/supabase-js";
import { ChatOpenAI } from "@langchain/openai";
// import {OpenAIApi} from 'openai';
import OpenAI from "openai";

dotConfig();
var gptarray;
let responseSent = false;
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,});

export default async function chatBot(req,res){
    try{
        let query=req.body.query;
        console.log("Query: ",query);
        gptarray=req.body.gptarray;
        console.log("Length of gpt Array: ",gptarray.length);
        // query=query.replace("\n", " ");
        // console.log("Query after replace: ",query);
        
        // const model = new ChatOpenAI({
        //     OPENAI_API_KEY:process.env.OPENAI_API_KEY,
        //     modelName: "gpt-4-0125-preview",
        //     temperature: 0.5});


        

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-3-large",
            dimensions: 1536,
          });

        const response = await embeddings.embedQuery(query);
        //console.log("Response: ",response);

        const result = await supabaseClient.rpc('match_documents5', {query_embedding:response,match_count:15});
        console.log("Result: ",result);
        var info = [];

            for (let i = 0; i < result.data.length; i++) {
            //console.log("Printing");
            //console.log(resultOne.data[i].content);
            info.push(result.data[i].content);
            }
            //console.log("After loop");
        gptarray[gptarray.length-1].content=gptarray[gptarray.length-1].content+` Relevant information is : ${info}`;
        
        //console.log("GPT Array: ",gptarray);

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: gptarray,
          });
          console.log(chatCompletion.choices[0]);
          res.send(chatCompletion.choices[0].message.content);
        // const completion = await openai.chat.completions.create({
        //     messages:gptarray,
        //     model:"gpt-4-turbo",
        //     temperature:0.5
        // })

        // console.log(completion.choices[0].message.content.toString());
        // return res.status(200).json(completion.choices[0].message.content.toString());
        // const stream =await model.stream(gptarray);
        // console.log("Stream: ",stream);
        


        // const completion = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages: gptarray,
        //     temperature: 0.5,
        //     stream: true,
        //   },
        //   { responseType: "stream" },
        //     {
        //         headers: { "Content-Type": "application/json" },
        //     });

        //     let completeResponse = "";
        //     completion.data.on("data", (data) => {
        //         const lines = data
        //           ?.toString()
        //           ?.split("\n")
        //           .filter((line) => line.trim() !== "");
          
        //         for (const line of lines) {
        //           const message = line.replace(/^data: /, "");
          
        //           try {
        //             const parsed = JSON.parse(message);
          
        //             if (parsed.choices && parsed.choices.length > 0) {
        //               const delta = parsed.choices[0].delta;
          
        //               if (delta && delta.content) {
        //                 completeResponse += delta.content;
        //               } else {
        //                 //console.log("Content not found in the delta", parsed);
        //               }
          
        //               if (parsed.choices[0].finish_reason === "stop") {
        //                 responseSent = true;
        //                 return res.send(completeResponse);
        //                 //console.log("Stream finished");
        //                 break;
        //               }
        //             } else {
        //               //console.log("Choices not found or empty in the response", parsed);
        //             }
        //           } catch (error) {
        //             console.log("Error parsing JSON response from OpenAI");
        //             //res.status(500).json("Error from OpenAI, chat not completed");
        //           }
        //         }
        //       });
        //       completion.data.on("end", async () => {
        //         console.log("Chat completed");


        //     if (!completeResponse)
        //         return ("No response from OpenAI");
        //     if (!responseSent)
        //          return completeResponse;
        //       });
        //   console.log("Complete Reponse is: ",completeResponse);
        //       res.send(completeResponse);
    }
    catch(err){
        console.log("Error in chatBot: ",err);
    }
}
