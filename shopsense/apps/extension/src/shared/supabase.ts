import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ubckxoomwuzmpsnmkgrz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CKFNM9El2ZcdDmL2NU_eow_Z_47Wsro";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
