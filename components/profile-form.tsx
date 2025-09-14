// components/profile-form.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { ProfileSchema } from "@/lib/schemas";
import InputField from "@/components/ui/inputfield";
import { toast } from "./ui/use-toast";

type ProfileValues = z.infer<typeof ProfileSchema>;

const ADDRESS_SEP = " | ";
const PFX = {
  sub: "แขวง/ตำบล ",
  dist: "เขต/อำเภอ ",
  prov: "จังหวัด ",
  post: "รหัสไปรษณีย์ ",
  country: "ประเทศ ",
};

// ---- Helpers ----
function buildAddress(v: ProfileValues): string | null {
  const parts: string[] = [];
  if (v.addr_line?.trim()) parts.push(v.addr_line.trim());
  if (v.subdistrict?.trim()) parts.push(PFX.sub + v.subdistrict.trim());
  if (v.district?.trim()) parts.push(PFX.dist + v.district.trim());
  if (v.province?.trim()) parts.push(PFX.prov + v.province.trim());
  if (v.postcode?.trim()) parts.push(PFX.post + v.postcode.trim());
  if (v.country?.trim()) parts.push(PFX.country + v.country.trim());
  return parts.length ? parts.join(ADDRESS_SEP) : null;
}
function stripPrefix(s: string, prefix: string) {
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}
function parseAddress(s: string | null | undefined) {
  let addr_line = "", subdistrict = "", district = "", province = "", postcode = "", country = "";
  if (!s) return { addr_line, subdistrict, district, province, postcode, country };
  const tokens = s.split(ADDRESS_SEP).map(t => t.trim()).filter(Boolean);
  const freeTexts: string[] = [];
  for (const t of tokens) {
    if (t.startsWith(PFX.sub)) subdistrict = stripPrefix(t, PFX.sub);
    else if (t.startsWith(PFX.dist)) district = stripPrefix(t, PFX.dist);
    else if (t.startsWith(PFX.prov)) province = stripPrefix(t, PFX.prov);
    else if (t.startsWith(PFX.post)) postcode = stripPrefix(t, PFX.post);
    else if (t.startsWith(PFX.country)) country = stripPrefix(t, PFX.country);
    else if (/^\d{5}$/.test(t) && !postcode) postcode = t;
    else freeTexts.push(t);
  }
  if (freeTexts.length) addr_line = freeTexts.join(" ");
  return { addr_line, subdistrict, district, province, postcode, country };
}

// ---- Configs for upload ----
const BUCKET = "mbucket";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function ProfileForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const disabled = loading || saving;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    mode: "onTouched",
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      addr_line: "",
      subdistrict: "",
      district: "",
      province: "",
      postcode: "",
      country: "ไทย",
    },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getUser();
        const user = sessionData?.user;
        if (!user) { setLoading(false); return; }

        const { data: row, error } = await supabase
          .from("user_info")
          .select("u_firstname, u_lastname, u_email, u_phone, u_address, url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!active) return;

        setValue("email", row?.u_email ?? user.email ?? "");
        setValue("firstname", row?.u_firstname ?? "");
        setValue("lastname", row?.u_lastname ?? "");
        setValue("phone", row?.u_phone ?? "");

        if (row?.u_address) {
          const p = parseAddress(row.u_address);
          setValue("addr_line", p.addr_line);
          setValue("subdistrict", p.subdistrict);
          setValue("district", p.district);
          setValue("province", p.province);
          setValue("postcode", p.postcode);
          setValue("country", p.country);
        }

        setAvatarUrl(row?.url ?? null);
      } catch (e: any) {
        setFormError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [setValue, supabase]);

  const onSubmit = async (values: ProfileValues) => {
    setSaving(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");

      const email = values.email?.trim() || user.email?.trim();
      if (!email) throw new Error("ไม่พบอีเมลใน session");

      const u_address = buildAddress(values);
      const { error } = await supabase
        .from("user_info")
        .upsert(
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

      setFormSuccess("บันทึกโปรไฟล์สำเร็จ");
      toast({
        variant:"success",
        title:"สำเร็จ",
        description:"บันทึกโปรไฟล์สำเร็จ"
      })
    } catch (e: any) {
      setFormError(e.message ?? "บันทึกไม่สำเร็จ");
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:"บันทึกข้อมูลไม่สำเร็จ"
      })
    } finally {
      setSaving(false);
    }
  };

  async function handleFileSelected(file: File) {
    // validate ก่อน อัปโหลด
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormError("รองรับเฉพาะ JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFormError("ไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file)); // โชว์ทันที
    setUploading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");

      // path: userId/uuid.ext
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const uid = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
      const path = `${user.id}/${uid}.${ext}`;

      // อัปโหลดตรงไป Storage (เลี่ยง Server Actions limit)
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (upErr) throw upErr;

      // สร้าง public URL (ต้องเปิด select policy/public bucket)
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("ไม่สามารถสร้าง URL ของรูปได้");

      // อัปเดต DB: url + u_email (กัน NOT NULL)
      const email = (await supabase.auth.getUser()).data.user?.email ?? null;
      if (!email) throw new Error("ไม่พบอีเมลใน session");

      const { error: dbErr } = await supabase
        .from("user_info")
        .upsert(
          { user_id: user.id, u_email: email, url: publicUrl },
          { onConflict: "user_id" }
        );
      if (dbErr) throw dbErr;

      // อัปเดต state ให้ UI
      setAvatarUrl(publicUrl);
      setFormSuccess("อัปโหลดรูปโปรไฟล์สำเร็จ");
      toast({
        variant:"success",
        title:"สำเร็จ",
        description:"อัปโหลดรูปโปรไฟล์สำเร็จ"
      })
    } catch (e: any) {
      console.error(e);
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:"บันทึกรูปภาพไม่สำเร็จไม่สำเร็จ"
      })
      setFormError(e?.message ?? "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      setAvatarPreview(null); // ให้ใช้ URL จริง
    }
  }

  async function handleRemoveAvatar() {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");

      const { error } = await supabase.from("user_info").update({ url: null }).eq("user_id", user.id);
      if (error) throw error;

      setAvatarUrl(null);
      setAvatarPreview(null);
      setFormSuccess("ลบรูปโปรไฟล์สำเร็จ");
      toast({
        variant:"success",
        title:"สำเร็จ",
        description:"ลบรูปโปรไฟล์สำเร็จ"
      })
      
    } catch (e: any) {
      setFormError(e?.message ?? "ลบรูปไม่สำเร็จ");
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:"ลบรูปภาพไม่สำเร็จ"
      })
    }
  }

  const busy = disabled || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-5" noValidate>
      {/* Avatar section */}
      <div className="sm:col-span-2 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelected(f);
            e.currentTarget.value = "";
          }}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy || uploading}
            className="px-6 py-2 bg-[#0b3d4f] text-white rounded-3xl border-2 border-black hover:bg-[#023047] transition-colors disabled:opacity-50"
          >
            {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
          </button>

          <button
            type="button"
            onClick={handleRemoveAvatar}
            disabled={busy || uploading}
            className="px-6 py-2 bg-white text-black rounded-3xl border-2 border-black hover:bg-[#f01a1a] hover:text-white transition-colors disabled:opacity-50"
          >
            ลบรูปโปรไฟล์
          </button>
        </div>
      </div>

      {/* --- ฟิลด์เดิม --- */}
      <InputField label="ชื่อ" placeholder="เลิฟรัก" disabled={busy} {...register("firstname")} error={errors.firstname?.message} />
      <InputField label="สกุล" placeholder="สงบใจ" disabled={busy} {...register("lastname")} error={errors.lastname?.message} />
      <InputField label="ที่อยู่อีเมล์" placeholder="example@gmail.com" readOnly className="bg-gray-100 text-gray-600 cursor-not-allowed" {...register("email")} error={errors.email?.message} />
      <InputField label="เบอร์โทรศัพท์" placeholder="0XX-XXX-XXXX" disabled={busy} {...register("phone")} error={errors.phone?.message} />
      <InputField label="ที่อยู่" placeholder="170/3 สะพานขาว" disabled={busy} {...register("addr_line")} className="sm:col-span-2" error={errors.addr_line?.message as string | undefined} />
      <InputField label="แขวง / ตำบล" placeholder="สี่พระยา" disabled={busy} {...register("subdistrict")} error={errors.subdistrict?.message} />
      <InputField label="เขต / อำเภอ" placeholder="บางรัก" disabled={busy} {...register("district")} error={errors.district?.message} />
      <InputField label="จังหวัด" placeholder="กรุงเทพมหานคร" disabled={busy} {...register("province")} error={errors.province?.message} />
      <InputField label="รหัสไปรษณีย์" placeholder="10500" disabled={busy} {...register("postcode")} error={errors.postcode?.message} />
      <InputField label="ประเทศ" placeholder="ไทย" disabled={busy} {...register("country")} error={errors.country?.message} />

      {/* <div className="sm:col-span-2 mt-1">
        {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{formError}</div>}
        {formSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">{formSuccess}</div>}
      </div> */}

      <div className="sm:col-span-2 flex justify-center mt-2 mb-2">
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2 bg-white text-black rounded-3xl border-2 border-black hover:bg-[#023047] hover:text-white transition-colors disabled:opacity-50"
        >
          {busy ? "กำลังบันทึก..." : "แก้ไขโปรไฟล์"}
        </button>
      </div>
    </form>
  );
}