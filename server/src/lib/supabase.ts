import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://bqifuljgxxmygnhwjsql.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaWZ1bGpneHhteWduaHdqc3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MDgyMjYsImV4cCI6MjEwNjA4NDIyNn0.MgkCquLr3211as_JPU5-ugY2E8c4QzQfdYl72aE-teU";

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
