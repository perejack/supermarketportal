import { createClient } from "@supabase/supabase-js";

// Testing credentials for Supabase project
const HARDCODED_SUPABASE_URL = "https://nlnuscpzgutkfapyneaa.supabase.co";
const HARDCODED_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbnVzY3B6Z3V0a2ZhcHluZWFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQxNzYwOSwiZXhwIjoyMTA1OTkzNjA5fQ.UaA_SIBZ1nymKZTwTvvfmlMIeURnZeSXAnICLIA6b1c";
export const HARDCODED_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbnVzY3B6Z3V0a2ZhcHluZWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MTc2MDksImV4cCI6MjEwNTk5MzYwOX0.CJbi4V1gAs4BgFariylgocwHdEP0b7P-zOHKcHvuVY0";

export function getSupabaseAdmin() {
  // Hardcoded values take priority — env vars cannot override them
  const url = HARDCODED_SUPABASE_URL;
  const serviceRoleKey = HARDCODED_SERVICE_ROLE_KEY;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

