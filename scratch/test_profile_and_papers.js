const fs = require("fs");
const path = require("path");

// Load env
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("Checking remote Supabase REST endpoints...");

async function checkRest() {
  // Query profiles count
  const profilesRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,email,full_name,role`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  console.log("Profiles status:", profilesRes.status);
  const profilesData = await profilesRes.json();
  console.log("Profiles count:", Array.isArray(profilesData) ? profilesData.length : profilesData);
  if (Array.isArray(profilesData)) {
    console.log("Sample profiles:", profilesData.slice(0, 5));
  }

  // Query papers count
  const papersRes = await fetch(`${supabaseUrl}/rest/v1/papers?select=id,title,author_user_id`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  console.log("Papers status:", papersRes.status);
  const papersData = await papersRes.json();
  console.log("Papers count:", Array.isArray(papersData) ? papersData.length : papersData);
}

checkRest();
