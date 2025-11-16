// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// Server-side client with Service Role Key (keep it secret)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
