import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config as dotConfig } from "dotenv";
import supabase from "@supabase/supabase-js";

dotConfig();

export var vectorStore;

export default async function usedcarembeddings(req, res) {
    console.log("In usedcarembeddings.js");
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        const loader = new CSVLoader("old_car_data.csv");
        console.log("Loader of used car details: ", loader);

        const docs = await loader.load();
        console.log("docs is: ", docs);
        let textDocs = [];
        let metaDocs = [];

        let titles = [];
        let prices = [];
        let sellerContacts = [];
        let locations = [];
        let images = [];
        let modelYears = [];
        let mileages = [];
        let fuelTypes = [];
        let transmissions = [];
        let registeredIns = [];
        let colors = [];
        let assemblies = [];
        let engineCapacities = [];
        let bodyTypes = [];
        let lastUpdateds = [];
        let adRefs = [];
        let carFeatures = [];
        let sellerComments = [];

        docs.forEach((doc) => {
            textDocs.push(doc.pageContent);
            metaDocs.push(doc.metadata);

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
                    case 'sellercontact':
                        sellerContacts.push(value);
                        break;
                    case 'location':
                        locations.push(value);
                        break;
                    case 'images':
                        images.push(value);
                        break;
                    case 'modelyear':
                        modelYears.push(value);
                        break;
                    case 'millage':
                        mileages.push(value);
                        break;
                    case 'fueltype':
                        fuelTypes.push(value);
                        break;
                    case 'transmission':
                        transmissions.push(value);
                        break;
                    case 'registeredin':
                        registeredIns.push(value);
                        break;
                    case 'color':
                        colors.push(value);
                        break;
                    case 'assembly':
                        assemblies.push(value);
                        break;
                    case 'enginecapacity':
                        engineCapacities.push(value);
                        break;
                    case 'bodytype':
                        bodyTypes.push(value);
                        break;
                    case 'lastupdated':
                        lastUpdateds.push(value);
                        break;
                    case 'adref':
                        adRefs.push(value);
                        break;
                    case 'carfeatures':
                        carFeatures.push(value);
                        break;
                    case 'sellercomments':
                        sellerComments.push(value);
                        break;
                }
            });
        });

        console.log("Before embeddings");
        vectorStore = await SupabaseVectorStore.fromTexts(
            textDocs,
            metaDocs,
            new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: "text-embedding-3-large",
                dimensions: 1536,
            }),
            {
                client: supabaseClient,
                tableName: "documents1",
                queryName: "match_documents7",
            }
        );
        console.log("After embeddings");

        for (let i = 0; i < docs.length; i++) {
            await supabaseClient
                .from('documents1')
                .update({
                    title: titles[i],
                    price: prices[i],
                    sellercontact: sellerContacts[i],
                    location: locations[i],
                    images: images[i],
                    modelyear: modelYears[i],
                    mileage: mileages[i],
                    fueltype: fuelTypes[i],
                    transmission: transmissions[i],
                    registeredin: registeredIns[i],
                    color: colors[i],
                    assembly: assemblies[i],
                    enginecapacity: engineCapacities[i],
                    bodytype: bodyTypes[i],
                    lastupdated: lastUpdateds[i],
                    adref: adRefs[i],
                    carfeatures: carFeatures[i],
                    sellercomments: sellerComments[i],
                })
                .eq('id', i+1);
        }
        console.log("Data updated in Supabase");
        res.status(200).json({ message: 'Embeddings created', vectorStore });
    } catch (err) {
        console.log("Error in usedcarembeddings: ", err);
        return res.status(500).json({ message: "An error occurred while creating embeddings.", error: err });
    }
}
