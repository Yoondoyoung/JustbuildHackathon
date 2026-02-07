import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxfadpcjergfpjzzjmax.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5hTu3lzJb-lLNwKho3SJqw_FgECuwTu";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
