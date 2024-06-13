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
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function processJson(jsonObj) {
  let result = "";

  for (let key in jsonObj) {
    if (jsonObj.hasOwnProperty(key) && key !== "flag") {
      result += `${key}: ${jsonObj[key]}\n`;
    }
  }

  return result.trim(); // Remove the trailing newline character
}

const getUserContent = (messages) => {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");
};

async function processChunk(chunk,userMessages,info) {
  // Perform your desired action on the chunk of data here
  console.log("Chunk: ", chunk);
  const chatCompletion2 = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "system", content: `You are a smart and intelligent assistant with knowledge of new automobiles in Pakistan. Your task is to summarize the content of new cars in Pakistan without missing any neccessary information (car's details, reviews, images links and it's features). You should not skip any car information. You summary should contain all the information needed enough to provide a detail answer to user queries i.e ${userMessages}. Remeber your task is to summarize the information without missing any information. Each car information should start from new line. 
    An example of your response is: {assisstant:Car 1: Honda City 50 lacs, and it's features are... It's reviews are: ... It's images are: ... 
    Car 2: Suzuki Alto 20 lacs, and it's features are... It's reviews are: ... It's images are: ...} 
    Your response should be in json format with one key value pair that is assisstant : your summary.
    ` 
  },
    {
      role : "user", content: `Car information to summarize is: ${info} `
  },
],
    response_format: { type: "json_object" },
  });
  let parsechat2response = JSON.parse(chatCompletion2.choices[0].message.content)
  console.log("Chat Completion 2: ", parsechat2response.assisstant);
  return parsechat2response.assisstant;
}

export default async function newCarChatBot(req, res) {
  try {
    // let query=req.body.query;
    // console.log("Query: ",query);
    gptarray = req.body.gptarray;
    console.log("Length of gpt Array: ", gptarray.length);
    const userMessages = getUserContent(gptarray);
    console.log("User Messages: ", userMessages);

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `You are a smart, helpful, and intelligent assistant with knowledge of new automobiles in Pakistan. You will return responses in JSON format. Follow the steps below to handle user queries:
              Think smartly which step to follow.

              Step 1: Analyze User Queries:
              
              Analyze all user queries so far, given in ${userMessages}.

              Extract key features from the queries, such as Price, Title (e.g., Suzuki Alto), Body Type (e.g., SUV), Displacement (engine size), Fuel or Engine Type, Transmission, Mileage, Seating Capacity, Top Speed, Ground Clearance, Horse Power, Torque, Boot Space, Fuel Tank Capacity, Tyre Size, Battery Capacity, Range, Charging Time, and Description (Like safety measures eg no of airbags, colour etc).
              Categorize these features intelligently, even if the exact words are not used.

              Response Generation:
              
              Step 1.1 If at least minimum of three key features are extracted, respond with the features in JSON format and include a flag with the value 1. Example response:

              {
                "flag": 1,
                "Price": "30 lacs",
                "Title": "Suzuki Alto",
                "Body Type": "Hatchback"
              }

              Step 1.2 : Make sure if fewer than three key features are extracted, ask relevant questions to gather more information. You must ask questions randomly and intelligently but not repeat questions that are answered. Ask minimum of 5 questions about features such as price budget, seating capacity, body type, specific brands, etc. Example response:
              [{
                "flag": 0,
                "Questions": [
                  "How much seating capacity are you looking for in a car?",
                  "What is your price budget?",
                  "What body type are you looking for like hatchback, SUV, sedan etc?",
                  "Do you have any specific title or brand like Suzuki, Toyota, Honda etc in your mind?",
                  "What is the engine size you are looking for?",
                  "What is your daily usage of the car like city driving, long routes etc?",
                  "What is your priority like fuel economy, performance, safety e.g no of airbags etc?",
                  "What is the fuel type you are looking for like petrol, diesel, hybrid etc?",
                  "What is the transmission type you are looking for like manual, automatic etc?",
                  "What is the fuel economy you are looking for like how much kms a car can go in one litre of fuel?",
                  "What are the specific features you are looking for like colour, sunroof, alloy rims, infotainment system etc?",
                ]
              }]
              Must make sure minimum of 3 features are extracted other than flag.

              Step 1.3 : If the user asks for help or suggestion in finding a new car, then ask questions from step 1.2 to extract features with flag zero.

              Step 1.4 : If the user asks about specific car like alto then extract whatever features you can and include them in your response with flag 1.

              Step 1.5 : Non-Automobile Queries:

              If a query unrelated to new automobiles is asked (other than greetings), respond with a short apology message and include a flag with the value 0. Example response:
              [{
                "flag": 0,
                "assistant": "I am sorry, I can only provide assistance to your queries that are related to new automobiles. If you have any queries related to new cars, I will be happy to help."
              }]

              Example User Queries and Responses:

              Query: "Recommend me some new automatic sedans under 30 lacs, with petrol engine in Pakistan."

              [{
                "flag": 1,
                "Price": "30 lacs",
                "Body Type": "Sedan",
                "Transmission": "Automatic",
                "Fuel Type": "Petrol"
              }]

              Query: "I need help finding a new car. OR suggest me a car."

              [{
                "flag": 0,
                "Questions": [
                  "How much seating capacity are you looking for in a car?",
                  "What is your price budget?",
                  "What body type are you looking for like hatchback, SUV, sedan etc?",
                  "Do you have any specific title or brand like Suzuki, Toyota, Honda etc in your mind?",
                  "What is the engine size you are looking for?",
                  "What is your daily usage of the car like city driving, long routes etc?",
                  "What is your priority like fuel economy, performance, safety e.g no of airbags etc?",
                  "What is the fuel type you are looking for like petrol, diesel, hybrid etc?",
                  "What is the transmission type you are looking for like manual, automatic etc?",
                  "What is the fuel economy you are looking for like how much kms a car can go in one litre of fuel?",
                  "What are the specific features you are looking for like colour, sunroof, alloy rims, infotainment system etc?",
                ]
              }]
              Query: "What's the top speed of Honda Civic?"
              [{
                "flag": 1,
                "Title": "Honda Civic",
                "Top Speed"
              }]

              Query: "Which SUV is better: Toyota Fortuner or Honda BR-V?"
              [{
                "flag": 1,
                "Title":"Toyota Fortuner Honda BR-V",
                "Body Type":"SUV"
              }]
              `,
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log(
      "Response from gpt: ",
      chatCompletion.choices[0].message.content
    );
    let responsefromgpt = JSON.parse(chatCompletion.choices[0].message.content);

    console.log("responsefromgpt: ", responsefromgpt);
    if (responsefromgpt.flag == 0) {
      console.log("In if body");
      console.log(chatCompletion.choices[0].message.content);
      res.send(chatCompletion.choices[0].message.content);
    } else if (responsefromgpt.flag == 1) {
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
      const result = await supabaseClient.rpc("match_documents6", {
        query_embedding: response,
        match_count: 20,
      });
      // console.log("Result: ", result);
      console.log("Result length:" , result.data.length);
      var info = [];
      for (let i = 0; i < result.data.length; i++) {
        //console.log("Printing");
        //console.log(resultOne.data[i].content);
        info.push(result.data[i].content);
      }
      console.log("Length of info: ", info.length);
      let chunkSize = 1;
      let summarizedInfo = [];
      for (let i = 0; i < info.length; i += chunkSize) {
        let chunk = info.slice(i, i + chunkSize);
        summarizedInfo.push(await processChunk(chunk,userMessages,info));
      }
      
      
      //console.log("After loop");
      gptarray[gptarray.length - 1].content =
        gptarray[gptarray.length - 1].content +
        ` Relevant summarized information of new cars is : ${summarizedInfo}`;

      console.log("GPT Array: ", gptarray);

      const chatCompletion1 = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: gptarray,
        response_format: { type: "json_object" },
      });
      console.log(chatCompletion1.choices[0]);
      res.send(chatCompletion1.choices[0].message.content);
    } else {
      console.log("in else");
      res.send("There might be some error! Please refresh and try again.");
    }
  } catch (err) {
    console.log("Error in chatBot: ", err);
    res.send(err);
  }
}

