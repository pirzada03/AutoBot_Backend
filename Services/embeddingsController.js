import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
//import supabaseClient from "../supabaseClient.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config as dotConfig } from "dotenv";
import supabase from "@supabase/supabase-js";

dotConfig();

export var vectorStore;


export default async function embeddings(req,res) {
    console.log("In embeddingsController.js");
    try{
        // if(req.body.param === 0){
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const loader = new CSVLoader("new_car_details.csv");
        console.log("Loader of new car details: ",loader);

        const docs = await loader.load();
        // console.log("Docs: ",docs);

        // const textSplitter = new RecursiveCharacterTextSplitter({
        //     chunkSize: 500,
        //     chunkOverlap: 20,
        //   });
        let textDocs=[];
        let metaDocs=[];
        // const allSplits = await textSplitter.splitDocuments(docs);
        // console.log("All Splits: ",allSplits);
        docs.forEach((Document => {
            textDocs.push(Document.pageContent);
            metaDocs.push(Document.metadata);
        }))
        console.log("Text Docs: ",textDocs);
        // console.log("Meta Docs: ",metaDocs);

        // vectorStore = await SupabaseVectorStore.fromTexts(
        //     textDocs,
        //     metaDocs,
        //     new OpenAIEmbeddings({
        //         openAIApiKey:process.env.OPENAI_API_KEY,
        //         modelName: "text-embedding-3-large",
        //         dimensions:1536,
        //     }),
        //     {
        //       client:supabaseClient,
        //       tableName: "documents",
        //       queryName: "match_documents",
        //     }
        //   );
        //   res.status(200).json({ message: 'Embeddings created', vectorStore });
        // }
        
        
       
        // console.log("ChatBot called");
        // return vectorStore;
      }
      catch(err){
        console.log("Error in chatBot: ",err);
        return res.status(500).json({message: "An error occurred while chatting with bot.",error:err});
      }
}

