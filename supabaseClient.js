import supabase from "@supabase/supabase-js";
import { config} from "dotenv";
import { config as dotConfig } from "dotenv";
dotConfig();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

export default supabaseClient;