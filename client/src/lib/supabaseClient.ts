import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY chưa được cấu hình — copy client/.env.example " +
      "thành client/.env.local và điền key từ Supabase. Đăng nhập/dữ liệu sẽ không hoạt động cho đến lúc đó.",
  );
}

// Falls back to a placeholder so the app can still render before Supabase is configured.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key",
);
