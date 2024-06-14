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

function processJson(jsonObj) {
  let result = '';

  for (let key in jsonObj) {
    if (jsonObj.hasOwnProperty(key) && key !== 'flag') {
      result += `${key}: ${jsonObj[key]}\n`;
    }
  }

  return result.trim();  // Remove the trailing newline character
}

const getUserContent = (messages) => {
  return messages
    .filter(message => message.role === 'user')
    .map(message => message.content)
    .join(' ');
};

export default async function newCarChatBot(req,res){
    try{
        // let query=req.body.query;
        // console.log("Query: ",query);
        gptarray=req.body.gptarray;
        console.log("Length of gpt Array: ",gptarray.length);
        const userMessages=getUserContent(gptarray);
        console.log("User Messages: ", userMessages);

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{
              "role":"system",
              "content":`You are a smart, helpful, and intelligent assistant with knowledge of new automobiles in Pakistan. You will return responses in JSON format. Follow the steps below to handle user queries:

              Analyze User Queries:
              
              Analyze all user queries so far, given in ${userMessages}.
              Extract key features from the queries, such as Price, Title (e.g., Suzuki Alto), Body Type (e.g., SUV), Displacement (engine size), Fuel Type, Transmission, Mileage, Seating Capacity, Top Speed, Dimensions (Length x Width x Height), Ground Clearance, Horse Power, Torque, Boot Space, Kerb Weight, Fuel Tank Capacity, Tyre Size, Battery Capacity, Range, and Charging Time, other features (like abs, ac, safety features like airbags, child locks, child seat anchors etc).
              Categorize these features intelligently, even if the exact words are not used.
              Response Generation:
              
              If at least three key features are extracted, respond with the features in JSON format and include a flag with the value 1. Example response:

              {
                "flag": 1,
                "Price": "30 lacs",
                "Title": "Suzuki Alto",
                "Body Type": "Hatchback"
              }

              If fewer than three key features are extracted, ask relevant questions to gather more information. You must ask questions randomly an intelligently. Ask minimum of 4 questions about features such as price budget, seating capacity, body type, specific brands, etc. Example response:
              [{
                "flag": 0,
                "Questions": [
                  "How much seating capacity are you looking for in a car?",
                  "What is your price budget?",
                  "What body type are you looking for like hatchback, SUV, sedan etc?",
                  "Do you have any specific title or brand like Suzuki, Toyota, Honda etc in your mind?"
                ]
              }]
              Non-Automobile Queries:

              If a query unrelated to automobiles is asked (other than greetings), respond with a short apology message and include a flag with the value 0. Example response:
              [{
                "flag": 0,
                "assistant": "I am sorry, I can only provide assistance to your queries that are related to automobiles. If you have any queries related to new cars, I will be happy to help."
              }]

              Example User Queries and Responses:

              Query: "Recommend me some new sedans under 30 lacs in Pakistan."

              [{
                "flag": 1,
                "Price": "30 lacs",
                "Body Type": "Sedan",
              }]

              Query: "I need help finding a new car."

              [{
                "flag": 0,
                "Questions": [
                  "How much seating capacity are you looking for in a car?",
                  "What is your price budget?",
                  "What body type are you looking for like hatchback, SUV, sedan etc?",
                  "Do you have any specific title or brand like Suzuki, Toyota, Honda etc in your mind?"
                ]
              }]
              Query: "What's the top speed of Honda Civic?"
              [{
                "flag": 1,
                "Title": "Honda Civic",
                "Top Speed": "220 km/h"
              }]

              Query: "Which SUV is better: Toyota Fortuner or Honda BR-V?"
              [{
                "flag": 1,
                "Title":"Toyota Fortuner Honda BR-V",
                "Body Type":"SUV"
              }]
              `
            }],
            response_format: { type: "json_object" },
          });

        console.log("Response from gpt: ",chatCompletion.choices[0].message.content);
        let responsefromgpt = JSON.parse(chatCompletion.choices[0].message.content);

        console.log("responsefromgpt: ",responsefromgpt);
        if(responsefromgpt.flag==0){
          console.log("In if body");
          console.log(chatCompletion.choices[0].message.content);
          res.send(chatCompletion.choices[0].message.content);

        }
        else if(responsefromgpt.flag==1){
          console.log("In else if body");
          let features = processJson(responsefromgpt);
          console.log("After processing", features);
          console.log(chatCompletion.choices[0].message.content);

          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "text-embedding-3-large",
            dimensions: 1536,
          });

        const response = await embeddings.embedQuery(features);
        const result = await supabaseClient.rpc('match_documents6', {query_embedding:response,match_count:20});
        // console.log("Result: ",result);
        var info = [];
        for (let i = 0; i < result.data.length; i++) {
          //console.log("Printing");
          //console.log(resultOne.data[i].content);
          info.push(result.data[i].content);
          }
          //console.log("After loop");
      gptarray[gptarray.length-1].content=gptarray[gptarray.length-1].content+` Relevant information of new cars are : ${info}`;
      
      // console.log("GPT Array: ",gptarray);

      const chatCompletion1 = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: gptarray,
          response_format: { type: "json_object" },
        });
        console.log(chatCompletion1.choices[0]);
       res.send(chatCompletion1.choices[0].message.content);

        }
        else{
          console.log("in else");
          res.send("There might be some error! Please refresh and try again.")
        }
        

    }
    catch(err){
        console.log("Error in chatBot: ",err);
        res.send(err);
    }
}