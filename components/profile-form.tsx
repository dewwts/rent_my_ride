"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { ProfileSchema } from "@/lib/schemas";
import InputField from "@/components/ui/inputfield"; // ⬅️ ใช้งานที่นี่

type ProfileValues = z.infer<typeof ProfileSchema>;

/** ---------- helpers: address build/parse (order-agnostic) ---------- */
const ADDRESS_SEP = " | ";
const PFX = {
  sub: "แขวง/ตำบล ",
  dist: "เขต/อำเภอ ",
  prov: "จังหวัด ",
  post: "รหัสไปรษณีย์ ",
  country: "ประเทศ ",
};

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
/** ------------------------------------------------------------------- */

export function ProfileForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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

  const disabled = loading || saving || isSubmitting;

  useEffect(() => {
    let active = true;
    (async () => {
      setFormError(null);
      setFormSuccess(null);
      setLoading(true);

      try {
        const { data: sessionData, error: uErr } = await supabase.auth.getUser();
        if (uErr?.message) {
          console.error("auth.getUser error:", { message: uErr.message, name: uErr.name });
        }
        const user = sessionData?.user;

        if (!user) {
          if (active) {
            setLoading(false);
            setFormError("ไม่พบสถานะการเข้าสู่ระบบบนฝั่งเบราว์เซอร์");
          }
          return;
        }

        const { data: row, error: qErr } = await supabase
          .from("user_info")
          .select("u_firstname, u_lastname, u_email, u_phone, u_address")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (qErr?.message) {
          console.error("select user_info error:", {
            message: qErr.message,
            code: qErr.code,
            details: (qErr as any).details,
            hint: (qErr as any).hint,
          });
          setFormError(qErr.message);
          setLoading(false);
          return;
        }

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

        setLoading(false);
      } catch (error) {
        console.error("Profile form initialization error:", error);
        if (active) {
          setFormError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [setValue, supabase]);

  const onSubmit = async (values: ProfileValues) => {
    setSaving(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const { data: sessionData, error: uErr } = await supabase.auth.getUser();
      if (uErr) {
        console.error("auth.getUser error:", uErr);
        throw new Error("ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้");
      }
      const user = sessionData?.user;
      if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");

      const email = values.email?.trim();
      if (!email) throw new Error("อีเมลว่างเปล่า (โปรดเข้าสู่ระบบใหม่)");

      const u_address = buildAddress(values);

      const { error: upErr } = await supabase
        .from("user_info")
        .upsert(
          {
            user_id: user.id,
            u_email: email,
            u_firstname: values.firstname,
            u_lastname: values.lastname,
            u_phone: values.phone || null,
            u_address,
          },
          { onConflict: "user_id" }
        );

      if (upErr) {
        console.error("upsert user_info error:", upErr);
        throw new Error(upErr.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setFormSuccess("บันทึกโปรไฟล์สำเร็จ");
    } catch (error: any) {
      console.error("Profile update error:", error);
      setFormError(error?.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-5" noValidate>
      <InputField
        label="ชื่อ"
        placeholder="เลิฟรัก"
        disabled={disabled}
        {...register("firstname")}
        error={errors.firstname?.message}
      />
      <InputField
        label="สกุล"
        placeholder="สงบใจ"
        disabled={disabled}
        {...register("lastname")}
        error={errors.lastname?.message}
      />

      {/* Email: ใช้ readOnly แทน disabled เพื่อให้ RHF ส่งค่าใน onSubmit */}
      <InputField
        label="ที่อยู่อีเมล์"
        placeholder="example@gmail.com"
        readOnly
        aria-disabled="true"
        className="bg-gray-100 text-gray-600 cursor-not-allowed"
        {...register("email")}
        error={errors.email?.message}
      />

      <InputField
        label="เบอร์โทรศัพท์"
        placeholder="0XX-XXX-XXXX"
        disabled={disabled}
        {...register("phone")}
        error={errors.phone?.message}
      />

      <InputField
        label="ที่อยู่"
        placeholder="170/3 สะพานขาว"
        disabled={disabled}
        {...register("addr_line")}
        className="sm:col-span-2"
        error={errors.addr_line?.message as string | undefined}
      />

      <InputField
        label="แขวง / ตำบล"
        placeholder="สี่พระยา"
        disabled={disabled}
        {...register("subdistrict")}
        error={errors.subdistrict?.message}
      />
      <InputField
        label="เขต / อำเภอ"
        placeholder="บางรัก"
        disabled={disabled}
        {...register("district")}
        error={errors.district?.message}
      />
      <InputField
        label="จังหวัด"
        placeholder="กรุงเทพมหานคร"
        disabled={disabled}
        {...register("province")}
        error={errors.province?.message}
      />
      <InputField
        label="รหัสไปรษณีย์"
        placeholder="10500"
        disabled={disabled}
        {...register("postcode")}
        error={errors.postcode?.message}
      />
      <InputField
        label="ประเทศ"
        placeholder="ไทย"
        disabled={disabled}
        {...register("country")}
        error={errors.country?.message}
      />

      {/* inline status */}
      <div className="sm:col-span-2 mt-1">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{formError}</p>
          </div>
        )}
        {formSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{formSuccess}</p>
          </div>
        )}
      </div>

      <div className="sm:col-span-2 flex justify-center mt-2 mb-2">
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-2 bg-white text-black rounded-3xl border-2 border-black hover:bg-[#023047] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? "กำลังบันทึก..." : "แก้ไขโปรไฟล์"}
        </button>
      </div>
    </form>
  );
}