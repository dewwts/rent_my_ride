import { loginInfo, profileInfo, userInfo } from "@/types/authInterface";
import { SupabaseClient } from "@supabase/supabase-js";
import z from "zod";
import { ProfileSchema } from "./schemas";
import { buildAddress } from "./utils";

export const SignUp = async (data: userInfo, supabase: SupabaseClient) => {
  const { data: user } = await supabase
    .from("user_info")
    .select("u_email")
    .eq("u_email", data.email)
    .single();
  if (user) {
    throw new Error("Email already exists");
  }
  const { error: signupError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        role: "user",
      },
    },
  });
  if (signupError) {
    throw signupError;
  }
  return true;
};

export const SignIn = async (data: loginInfo, supabase: SupabaseClient) => {
  const { error: SignInError } = await supabase.auth.signInWithPassword({
    email: data.email.trim().toLowerCase(),
    password: data.password,
  });
  if (SignInError) {
    throw SignInError;
  }
  return true;
};

export const SignOut = async (supabase: SupabaseClient) => {
  await supabase.auth.signOut();
  return true;
};

export const getRole = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("ไม่เจอผู้ใช้งานนี้ในฐานข้อมูล");
  }
  const { data: row, error: getRoleError } = await supabase
    .from("user_info")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (getRoleError) {
    throw getRoleError;
  }
  return row?.role;
};
export const getFirstname = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: userInfo, error: err } = await supabase
      .from("user_info")
      .select("u_firstname")
      .eq("user_id", user.id)
      .single();
    if (userInfo) {
      return userInfo.u_firstname;
    }
    throw new Error("ไม่เจอผู้ใช้งานนี้ในฐานข้อมูล");
  }
  // throw new Error("โปรดเข้าสู่ระบบก่อนใช้งาน")
};

export const getProfile = async (supabase: SupabaseClient) => {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  if (!user) throw new Error("โปรดเข้าสู่ระบบก่อนใช้งาน");
  const { data: row, error } = await supabase
    .from("user_info")
    .select("u_firstname, u_lastname, u_email, u_phone, u_address, url")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  const object: profileInfo = {
    u_firstname: row?.u_firstname,
    u_lastname: row?.u_lastname,
    u_email: row?.u_email,
    u_address: row?.u_address,
    u_phone: row?.u_phone,
    url: row?.url,
  };
  return object;
};

type ProfileValues = z.infer<typeof ProfileSchema>;

export const updateProfile = async (
  supabase: SupabaseClient,
  values: ProfileValues
) => {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");
  const email = values.email?.trim() || user.email?.trim();
  if (!email) throw new Error("ไม่พบอีเมลใน session");
  const u_address = buildAddress(values);
  const { error } = await supabase.from("user_info").upsert(
    {
      user_id: user.id,
      u_email: email, // กัน NOT NULL
      u_firstname: values.firstname,
      u_lastname: values.lastname,
      u_phone: values.phone || null,
      u_address,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
  return true;
};
const BUCKET = "mbucket";
// const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export const updateAvatar = async (supabase: SupabaseClient, file: File) => {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData?.user;
  if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");

  // path: userId/uuid.ext
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const uid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());
  const path = `${user.id}/${uid}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (upErr) throw new Error("เกิดปัญหากับพื้นที่เก็บข้อมูล");

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) throw new Error("ไม่สามารถสร้าง URL ของรูปได้");

  const email = (await supabase.auth.getUser()).data.user?.email ?? null;
  if (!email) throw new Error("ไม่พบอีเมลใน session");

  const { error: dbErr } = await supabase
    .from("user_info")
    .upsert(
      { user_id: user.id, u_email: email, url: publicUrl },
      { onConflict: "user_id" }
    );
  if (dbErr) throw new Error("ฐานข้อมูลมีปัญหา");
  return publicUrl;
};
