import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ohmqnuoxtjuhxbqighyq.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obXFudW94dGp1aHhicWlnaHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTEyMDAsImV4cCI6MjEwNTg4NzIwMH0.SchxCAB_IKn99hNtZR6-L0pMWICJGD1n3vsSCXLp5ks";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
