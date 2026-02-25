import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "TU_PROJECT_URL";
const supabaseKey = "TU_ANON_PUBLIC_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);