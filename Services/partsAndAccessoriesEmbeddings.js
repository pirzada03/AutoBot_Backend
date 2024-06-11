import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config as dotConfig } from "dotenv";
import supabase from "@supabase/supabase-js";

dotConfig();

export var vectorStore;

export default async function partsandaccessoriesembeddings(req, res) {
    console.log("In parts and accessories embeddings.js");
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
        
        const loader = new CSVLoader("interior.csv", { encoding: "utf-8" });  // Use the path of the uploaded file
        console.log("Loader of parts and accessories details: ", loader);

        const docs = await loader.load();
        console.log("docs is: ", docs);
        let textDocs = [];
        let metaDocs = [];

        let titles = [];
        let originalPrices = [];
        let discountedPrices = [];
        let descriptions = [];
        let types = [];

        docs.forEach((doc, index) => {
            // Determine the type based on the index
            const type = index < 46 ? 'interior' : 'exterior';

            // Include the type in the text content
            const textContentWithType = doc.pageContent + `\nType: ${type}`;
            textDocs.push(textContentWithType);
            metaDocs.push(doc.metadata);

            const columns = doc.pageContent.split('\n');
            columns.forEach((column) => {
                const [key, value] = column.split(': ').map(item => item.trim());
                switch (key) {
                    case 'Title':
                        titles.push(value);
                        break;
                    case 'OriginalPrice':
                        originalPrices.push(value);
                        break;
                    case 'DiscountedPrice':
                        discountedPrices.push(value);
                        break;
                    case 'Description':
                        descriptions.push(value);
                        break;
                }
            });

            types.push(type);
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
                tableName: "documents2",
                queryName: "match_documents8",
            }
        );
        console.log("After embeddings");

        for (let i = 0; i < docs.length; i++) {
            await supabaseClient
                .from('documents2')
                .update({
                    title: titles[i],
                    originalprice: originalPrices[i],
                    discountedprice: discountedPrices[i],
                    description: descriptions[i],
                    type: types[i],
                })
                .eq('id', i+1);
        }
        console.log("Data updated in Supabase");
        res.status(200).json({ message: 'Embeddings created', vectorStore });
    } catch (err) {
        console.log("Error in partsandaccessoriesembeddings: ", err);
        return res.status(500).json({ message: "An error occurred while creating embeddings.", error: err });
    }
}
