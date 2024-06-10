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
              "content":`You are a smart, helpful, and intelligent assistant with knowledge of used automobiles in Pakistan. You will return responses in JSON format. You will be given the query of the user. You must follow the steps below:

              Step 1: Analyze all the queries of the user so far that is ${userMessages}.
              Keep history of user queries in mind.
              
              Step 1.1: Extract key features intelligently especially when asked to compare such as:
              Price (e.g., 30 lacs)
              Title (e.g., Suzuki Alto)
              Location (e.g., Karachi)
              Model Year (e.g., 2018)
              Mileage (e.g., 50,000 km)
              Fuel Type (e.g., Petrol)
              Transmission (e.g., Automatic)
              Registered In (e.g., Lahore)
              Color (e.g., White)
              Assembly (Local or Imported)
              Engine Capacity (e.g., 1000 cc)
              Body Type (e.g., SUV)
              Car Features (e.g., Sunroof, ABS)
              You have to analyze the query and extract these key features if found. You may not find the exact words, so be smart and categorize these features intelligently. Your response must include a flag key-value pair with a value of 1 if a minimum of 5 key features are extracted.
              
              Example response if minimum 5 features are extracted:
              {
                "flag": 1,
                "Price": "30 lacs",
                "Title": "Suzuki Alto",
                "Location": "Karachi",
                "model":"2022",
                "Mileage":"70000 km",
                "Color":"White",
              }

              Step 1.2: If you cannot extract at least 5 key features, ask questions related to those features such as price budget, location, model year, mileage, fuel type, transmission, registered in, color, assembly, engine capacity, body type, car features.
                Ask questions in all cases other than the case where the user asks for a comparison.

                Example response if less than 5 features are extracted:
                {
                    "flag": 0,
                    "Questions": [
                      "What is your price budget?",
                      "Where are you located?",
                      "What model year are you looking for?",
                      "What is the mileage limit for the car?",
                      "Do you have a preference for fuel type?",
                      "What type of transmission do you prefer?",
                      "Which city do you want the car to be registered in?",
                      "What color of the car are you interested in?",
                      "Are you looking for a locally assembled or imported car?",
                      "What engine capacity are you looking for?",
                      "What body type are you interested in like hatchback, SUV, sedan, etc.?",
                      "Are there any specific features you are looking for in a car?"
                    ]
                  }
                  You are not bound to follow this example. You can ask questions related to price budget, location, model year, mileage, fuel type, transmission, registered in, color, assembly, engine capacity, body type, car features. Be intelligent, smart, and creative in asking questions so you can shortlist a car through features and user requirements.

                    Step 1.3: If the user asks any question unrelated to automobiles or greetings, respond with an apology message.
                    Example response if unrelated question is asked:
                    {
                        "flag": 0,
                        "assistant": "I am sorry, I can only provide assistance to your queries that are related to automobiles. If you have any queries related to used cars, I will be happy to help."
                      }

                      Step 1.4: Make sure if the user asks for suggestions or help in buying a car, ask questions about the features they are looking for and include flag with value 0 in response.
                        Step 1.5: If the user asks about a specific car then just extract features like in step 1.1.
                        Step 1.6: If the user just greets then just simply greet back and ask how you can help in providing assistance related to used cars in Pakistan with flag 0 in response.

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
        const result = await supabaseClient.rpc('match_documents7', {query_embedding:response,match_count:50});
        console.log("Result: ",result);
        var info = [];
        for (let i = 0; i < result.data.length; i++) {
          //console.log("Printing");
          //console.log(resultOne.data[i].content);
          info.push(result.data[i].content);
          }
          //console.log("After loop");
      gptarray[gptarray.length-1].content=gptarray[gptarray.length-1].content+` Relevant information is : ${info}`;
      
      console.log("GPT Array: ",gptarray);

      const chatCompletion1 = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: gptarray,
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
