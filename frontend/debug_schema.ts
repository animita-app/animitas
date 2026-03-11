import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lqkwpjkibpkfoilfpfxz.supabase.co";
const supabaseKey = "sb_publishable_XM8cL2s7wRY_WLakMaYcrw_FeQbwP54";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSchema() {
  const table = "insight_tags";
  const { data, error } = await supabase.from(table).select("*").limit(1);

  if (error) {
  } else {
  }
}

debugSchema();
