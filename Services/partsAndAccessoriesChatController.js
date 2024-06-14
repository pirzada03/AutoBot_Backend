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

export default async function partsAndAccessoriesChatBot(req,res){
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
              "content":`You are a smart, helpful, and intelligent assistant with knowledge of automobile parts and accessories in Pakistan. You will return responses in JSON format. You will be given the query of the user. You must follow the steps below:

              Step 1: Analyze all the queries of the user so far that is ${userMessages}.
              Keep history of user queries in mind.
              
              Step 1.1: Extract key features intelligently especially when asked to compare such as:
              
              Title (e.g., Suzuki Alto VX And VXR Automatic Japanese Side Mirror)
              OriginalPrice (e.g., Rs.2,328)
              DiscountedPrice (e.g., Rs.1,200)
              Description (e.g., Suzuki Alto VX And VXR Automatic Japanese Side Mirror Chrome Cover RS Style- Model 2018-2021 MA00159 white colour)
              Type (e.g., exterior or interior)
              Model (e.g., 2021)
              You have to analyze the query and extract these key features if found. You may not find the exact words, so be smart and categorize these features intelligently. Your response must include a flag key-value pair with a value of 1 if a minimum of 2 key features are extracted.
              
              Example response if a minimum of 2 features are extracted:
              {
                "flag": 1,
                "Title": "Suzuki Alto VX And VXR Automatic Japanese Side Mirror",
                "OriginalPrice": "Rs.2,328",
                "DiscountedPrice": "Rs.1,200",
                "Description": "Suzuki Alto VX And VXR Automatic Japanese Side Mirror Chrome Cover RS Style- Model 2018-2021 MA00159 white colour",
                "Type": "exterior",
                "Model": "2021"
              }
              Step 1.2: If you cannot extract at least 2 key features, ask questions related to those features such as title of parts or accessories, title of car, model year of car, original price, discounted price, description, type (interior or exterior). Ask questions in all cases other than the case where the user asks for a comparison.

                Example response if less than 2 features are extracted:
                {
                    "flag": 0,
                    "Questions": [
                      "What part or accessory you are interested in to buy?",
                      "What is the model year of the car for this part or accessory?"
                      "Is the part or accessory for the interior or exterior of the car?",
                      "Can you provide a description of the part or accessory like what you want e.g colour, size etc?",
                      "What is your price budget?",
                    ]
                  }
                  Be intelligent, smart, and creative in asking questions so you can shortlist a part or accessory through features and user requirements.

                    Step 1.3: If the user asks any question unrelated to parts and accessories, respond with an apology message.

                    Example response if an unrelated question is asked:
                    {
                        "flag": 0,
                        "assistant": "I am sorry, I can only provide assistance to your queries that are related to automobile parts and accessories. If you have any queries related to this, I will be happy to help."
                      }
                      Step 1.4: Make sure if the user asks for suggestions or help in finding a part or accessory, ask questions about the features they are looking for and include flag with value 0 in response.

                    Step 1.5: If the user asks about a specific part or accessory then just extract features like in step 1.1.

                    Step 1.6: If the user just greets then just simply greet back and ask how you can help in providing assistance related to automobile parts and accessories in Pakistan with flag 0 in response.
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
        const result = await supabaseClient.rpc('match_documents7', {query_embedding:response,match_count:20});
        console.log("Result: ",result);
        var info = [];
        for (let i = 0; i < result.data.length; i++) {
          //console.log("Printing");
          //console.log(resultOne.data[i].content);
          info.push(result.data[i].content + " " + result.data[i].rating + " " + result.data[i].numberoforders + " " + result.data[i].numberofratings);
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
