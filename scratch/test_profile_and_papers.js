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

console.log("Checking remote Supabase public.users Table...");

async function checkUsers() {
  const targetId = "0d1131b4-28a5-46c6-98db-821db768e209";

  // Query public.users for target ID
  const userRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${targetId}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  console.log("public.users Status:", userRes.status, userRes.statusText);
  const userData = await userRes.json();
  console.log(`public.users for ID ${targetId}:`, userData);

  // Query all public.users
  const allUsersRes = await fetch(`${supabaseUrl}/rest/v1/users?select=id,full_name,email,affiliation,country,role&order=created_at.desc`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  console.log("All public.users Status:", allUsersRes.status);
  const allUsersData = await allUsersRes.json();
  console.log("All public.users count:", Array.isArray(allUsersData) ? allUsersData.length : allUsersData);
  if (Array.isArray(allUsersData)) {
    console.log("All public.users records:", allUsersData);
  }
}

checkUsers();
