// app/actions/upload-avatar.ts
"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "mbucket";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadAvatar(formData: FormData) {
  try {
    const file = formData.get("avatar") as File | null;
    if (!file) return { ok: false, error: "ไม่พบไฟล์รูปภาพ" };
    if (!ALLOWED_TYPES.includes(file.type)) return { ok: false, error: `ชนิดไฟล์ไม่รองรับ (${file.type})` };
    if (file.size > MAX_BYTES) return { ok: false, error: "ไฟล์ต้องไม่เกิน 5MB" };

    const supabase = await createClient();

    // ต้องมี session
    const { data: sessionData, error: userErr } = await supabase.auth.getUser();
    if (userErr) return { ok: false, error: `auth.getUser: ${userErr.message}` };
    const user = sessionData?.user;
    if (!user) return { ok: false, error: "ยังไม่ได้เข้าสู่ระบบ" };

    // ---- หาอีเมลที่จะใส่ลง u_email (กัน NOT NULL) ----
    // 1) ลองดูจากแถวเดิมใน user_info ก่อน
    const { data: existing } = await supabase
      .from("user_info")
      .select("u_email")
      .eq("user_id", user.id)
      .maybeSingle();

    const uEmail = existing?.u_email ?? user.email ?? null;
    if (!uEmail) {
      // ถ้าไม่มีจริง ๆ ให้บอกผู้ใช้ไปก่อน (หรือคุณจะเปลี่ยน schema/drop not null ก็ได้)
      return { ok: false, error: "ไม่พบอีเมลของผู้ใช้ (u_email) สำหรับ upsert" };
    }

    // ---- อัปโหลดไฟล์ขึ้น Storage ----
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (upErr) {
      console.error("storage.upload error:", upErr);
      return { ok: false, error: `storage.upload: ${upErr.message}` };
    }

    // ได้ public URL (ถ้าบัคเก็ตเปิดอ่าน public)
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) return { ok: false, error: "getPublicUrl: publicUrl is empty" };

    // ---- บันทึก URL กลับลง user_info พร้อม u_email เสมอ ----
    const { error: dbErr } = await supabase
      .from("user_info")
      .upsert(
        { user_id: user.id, u_email: uEmail, url: publicUrl },
        { onConflict: "user_id" }
      );

    if (dbErr !== null) {
      console.error("upsert user_info.url error:", dbErr);
      return { ok: false, error: `upsert user_info: ${dbErr?.message ?? "unknown error"}` };
    }

    return { ok: true, url: publicUrl, path };
  } catch (e: any) {
    console.error("uploadAvatar fatal:", e);
    return { ok: false, error: e?.message ?? "Unexpected server error" };
  }
}
