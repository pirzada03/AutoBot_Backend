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
        
        const loader = new CSVLoader("Updated_CSV_DataFrame.csv", { encoding: "utf-8" });  // Use the path of the uploaded file
        console.log("Loader of parts and accessories details: ", loader);

        const docs = await loader.load();
        console.log("docs is: ", docs);
        let textDocs = [];
        let metaDocs = [];

        let descriptions = [];
        let types = [];
        let names = [];
        let categories = [];
        let brands = [];
        let prices = [];
        let quantities = [];
        let compatibilities = [];
        let images = [];
        let subcategories = [];
        let numberoforders = [];
        let ratings = [];
        let numberofratings = [];

        docs.forEach((doc, index) => {
            textDocs.push(doc.pageContent);
            metaDocs.push(doc.metadata);

            const columns = doc.pageContent.split('\n');
            columns.forEach((column) => {
                const [key, value] = column.split(': ').map(item => item.trim());
                switch (key) {
                    case 'name':
                        names.push(value);
                        break;
                    case 'description':
                        descriptions.push(value);
                        break;
                    case 'category':
                        categories.push(value);
                        break;
                    case 'brand':
                        brands.push(value);
                        break;
                    case 'price':
                        prices.push(parseFloat(value));
                        break;
                    case 'quantity':
                        quantities.push(parseInt(value));
                        break;
                    case 'images':
                        images.push(value.split(',').map(image => image.trim()));
                        break;
                    case 'compatibility':
                        compatibilities.push(value.split(',').map(comp => comp.trim()));
                        break;
                    case 'type':
                        types.push(value);
                        break;
                    case 'subcategory':
                        subcategories.push(value);
                        break;
                    case 'numberoforders':
                        numberoforders.push(parseInt(value));
                        break;
                    case 'rating':
                        ratings.push(parseFloat(value));
                        break;
                    case 'numberofratings':
                        numberofratings.push(parseInt(value));
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
                tableName: "documents2",
                queryName: "match_documents8",
            }
        );
        console.log("After embeddings");

        for (let i = 0; i < docs.length; i++) {
            await supabaseClient
                .from('documents2')
                .update({
                    name: names[i],
                    description: descriptions[i],
                    category: categories[i],
                    brand: brands[i],
                    price: prices[i],
                    quantity: quantities[i],
                    compatibility: compatibilities[i],
                    images: images[i],
                    subcategory: subcategories[i],
                    numberoforders: numberoforders[i],
                    rating: ratings[i],
                    numberofratings: numberofratings[i],
                    type: types[i],
                })
                .eq('id', i + 1);
        }
        console.log("Data updated in Supabase");
        res.status(200).json({ message: 'Embeddings created', vectorStore });
    } catch (err) {
        console.log("Error in partsandaccessoriesembeddings: ", err);
        return res.status(500).json({ message: "An error occurred while creating embeddings.", error: err });
    }
}
