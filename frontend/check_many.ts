import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lqkwpjkibpkfoilfpfxz.supabase.co";
const supabaseKey = "sb_publishable_XM8cL2s7wRY_WLakMaYcrw_FeQbwP54";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMultiple() {
  const tables = [
    "heritage_sites",
    "profiles",
    "user_profiles",
    "insight_tags",
    "heritage_site_reactions",
    "heritage_site_comments",
  ];

  for (const t of tables) {
    const { error } = await supabase.from(t).select("count", {
      count: "exact",
      head: true,
    });
    if (error) {
      console.log(`${t}: FAIL - ${error.message} (${error.code})`);
    } else {
      console.log(`${t}: OK`);
    }
  }
}

checkMultiple();
