// lib/supabase/server.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function getUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  );
}

function getAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

/**
 * สร้าง client ใหม่ทุกครั้งที่เรียกใช้ (สำคัญมากบน Server/Edge)
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getUrl(), getAnonKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Server Component จะ set cookie ไม่ได้เสมอไป — ปล่อยผ่าน
        try {
          cookieStore.set({ name, value, ...options });
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {}
      },
    },
  });
}

export function createAdminClient() {
  const supabaseUrl = getUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    }
  });
}
