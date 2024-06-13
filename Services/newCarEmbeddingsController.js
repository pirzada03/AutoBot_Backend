import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
//import supabaseClient from "../supabaseClient.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config as dotConfig } from "dotenv";
import supabase from "@supabase/supabase-js";

dotConfig();

export var vectorStore;


export default async function newcarembeddings(req,res) {
    console.log("In embeddingsController.js");
    try{
        // if(req.body.param === 0){
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const loader = new CSVLoader("new_car_details.csv");
        console.log("Loader of new car details: ",loader);

        const docs = await loader.load();
       console.log("Docs: ",docs);

        let textDocs=[];
        let metaDocs=[];
       // Separate arrays for each column
       let titles = [];
       let prices = [];
       let bodyTypes = [];
       let groundClearances = [];
       let displacements = [];
       let transmissions = [];
       let horsePowers = [];
       let torques = [];
       let bootSpaces = [];
       let kerbWeights = [];
       let fuelTypes = [];
       let fuelTankCapacities = [];
       let seatingCapacities = [];
       let topSpeeds = [];
       let tyreSizes = [];
       let batteryCapacities = [];
       let ranges = [];
       let chargingTimes = [];

       docs.forEach((doc) => {
           textDocs.push(doc.pageContent);
           metaDocs.push(doc.metadata);

           // Extract column values from pageContent
           const columns = doc.pageContent.split('\n');
           columns.forEach((column) => {
               const [key, value] = column.split(': ').map(item => item.trim());
               switch (key) {
                   case 'title':
                       titles.push(value);
                       break;
                   case 'price':
                       prices.push(value);
                       break;
                   case 'Body Type':
                       bodyTypes.push(value);
                       break;
                   case 'Ground Clearance':
                       groundClearances.push(value);
                       break;
                   case 'Displacement':
                       displacements.push(value);
                       break;
                   case 'Transmission Type':
                       transmissions.push(value);
                       break;
                   case 'Horse Power':
                       horsePowers.push(value);
                       break;
                   case 'Torque':
                       torques.push(value);
                       break;
                   case 'Boot Space':
                       bootSpaces.push(value);
                       break;
                   case 'Kerb Weight':
                       kerbWeights.push(value);
                       break;
                   case 'Engine Type':
                       fuelTypes.push(value);
                       break;
                   case 'Fuel Tank Capacity':
                       fuelTankCapacities.push(value);
                       break;
                   case 'Seating Capacity':
                       seatingCapacities.push(value);
                       break;
                   case 'Max Speed':
                       topSpeeds.push(value);
                       break;
                   case 'Tyre Size':
                       tyreSizes.push(value);
                       break;
                   case 'Battery Capacity':
                       batteryCapacities.push(value);
                       break;
                   case 'Range':
                       ranges.push(value);
                       break;
                   case 'Charging Time':
                       chargingTimes.push(value);
                       break;
               }
           });
       });

    //    console.log("Titles: ", titles);
    //    console.log("Prices: ", prices);
    //    console.log("Body Types: ", bodyTypes);
    //    console.log("Ground Clearances: ", groundClearances);
    //    console.log("Displacements: ", displacements);
    //    console.log("Transmissions: ", transmissions);
    //    console.log("Horse Powers: ", horsePowers);
    //    console.log("Torques: ", torques);
    //    console.log("Boot Spaces: ", bootSpaces);
    //    console.log("Kerb Weights: ", kerbWeights);
    //    console.log("Fuel Types: ", fuelTypes);
    //    console.log("Fuel Tank Capacities: ", fuelTankCapacities);
    //    console.log("Seating Capacities: ", seatingCapacities);
    //    console.log("Top Speeds: ", topSpeeds);
    //    console.log("Tyre Sizes: ", tyreSizes);
    //    console.log("Battery Capacities: ", batteryCapacities);
    //    console.log("Ranges: ", ranges);
    //    console.log("Charging Times: ", chargingTimes);
    //     console.log("Text Docs: ",textDocs);
    //     console.log("Meta Docs: ",metaDocs);
       console.log("Before embeddings");
        vectorStore = await SupabaseVectorStore.fromTexts(
            textDocs,
            metaDocs,
            new OpenAIEmbeddings({
                openAIApiKey:process.env.OPENAI_API_KEY,
                modelName: "text-embedding-3-large",
                dimensions:1536,
            }),
            {
              client:supabaseClient,
              tableName: "documents",
              queryName: "match_documents",
            }
          );
          console.log("After embeddings");

        //   console.log("Vector Store: ",vectorStore);
          for (let i = 0; i < docs.length; i++) {
            await supabaseClient
                .from('documents')
                .update({
                    Title: titles[i],
                    Price: prices[i],
                    Body_Type: bodyTypes[i],
                    Ground_Clearance: groundClearances[i],
                    Displacement: displacements[i],
                    Transmission: transmissions[i],
                    Horse_Power: horsePowers[i],
                    Torque: torques[i],
                    Boot_Space: bootSpaces[i],
                    Kerb_Weight: kerbWeights[i],
                    Fuel_Type: fuelTypes[i],
                    Fuel_Tank_Capacity: fuelTankCapacities[i],
                    Seating_Capacity: seatingCapacities[i],
                    Top_Speed: topSpeeds[i],
                    Tyre_Size: tyreSizes[i],
                    Battery_Capacity: batteryCapacities[i],
                    Range: ranges[i],
                    Charging_Time: chargingTimes[i],
                })
                .eq('id' , i+1 );
        }
        console.log("Data updated in supabase");
          res.status(200).json({ message: 'Embeddings created', vectorStore });
        }
        
        
       
        // console.log("ChatBot called");
        
      
      catch(err){
        console.log("Error in chatBot: ",err);
        return res.status(500).json({message: "An error occurred while chatting with bot.",error:err});
      }
}

