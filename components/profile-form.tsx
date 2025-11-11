"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { ProfileSchema } from "@/lib/schemas";
import InputField from "@/components/ui/inputfield";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { getProfile, removeAvatar, updateAvatar, updateProfile } from "@/lib/authServices";
import { parseAddress } from "@/lib/utils";
import {MAX_BYTES, ALLOWED_TYPES} from "@/types/avatarConstraint"
import { Button } from "./ui/button";
import axios, { AxiosError } from "axios";
import Image from "next/image";

type ProfileValues = z.infer<typeof ProfileSchema>;

export function ProfileForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeID, setStripeID] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter()
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
        const row = await getProfile(supabase)
        if (!active) return;

        setValue("email", row?.u_email ??  "");
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
        setStripeID(row?.stripe_account_id ?? null)
      } catch (e: unknown) {
        let error = "โหลดข้อมูลไม่สำเร็จ"
        if (e instanceof Error){
          error = e.message
        }
        console.error(error);
        toast({
            variant:"destructive",
            title:"ไม่สำเร็จ",
            description:error
        })
      } finally {
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [setValue, supabase]);

  const onSubmit = async (values: ProfileValues) => {
    setSaving(true);
    try {
      await updateProfile(supabase, values)
      toast({
        variant:"success",
        title:"สำเร็จ",
        description:"บันทึกโปรไฟล์สำเร็จ"
      })
      router.refresh()
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "บันทึกไม่สำเร็จ";
      console.error(errorMessage);
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:errorMessage
      })
    } finally {
      setSaving(false);
    }  };

  async function handleFileSelected(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("รองรับเฉพาะ JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > MAX_BYTES) {
      console.error("ไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    setAvatarPreview(URL.createObjectURL(file)); // โชว์ทันที
    setUploading(true);
    try {
      const publicUrl = await updateAvatar(supabase, file) 
      setAvatarUrl(publicUrl);
      toast({
        variant:"success",
        title:"สำเร็จ",
        description:"อัปโหลดรูปโปรไฟล์สำเร็จ"
      })
    } catch (e: unknown) {
      console.error(e);
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:"บันทึกรูปภาพไม่สำเร็จ"
      })
      console.error(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      setAvatarPreview(null); // ให้ใช้ URL จริง
    }
  }

  async function handleRemoveAvatar() {
    try {
      await removeAvatar(supabase)
      setAvatarUrl(null);
      setAvatarPreview(null);
      toast({
        variant:"success",
        title:"สำเร็จ",
        description:"ลบรูปโปรไฟล์สำเร็จ"
      })
      
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : "ลบรูปไม่สำเร็จ");
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:"ลบรูปภาพไม่สำเร็จ"
      })
    }
  }

  const busy = disabled || isSubmitting;
  const handleConnectBank = async()=>{
    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/stripe/create-connect-account`)
      setStripeID(response.data.data.aid)
      window.location.href = response.data.data.url
    }catch(err: unknown){
      let msg = "เกิดปัญหา"
      if (err instanceof AxiosError){
        msg = err.response?.data.error
      }else if (err instanceof Error){
        msg = err.message
      }
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:msg
      })
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-5" noValidate>
      {/* Avatar section */}
      <div className="sm:col-span-2 flex items-center gap-4">
        <div className=" relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
          {avatarPreview ? (
            <Image src={avatarPreview} fill={true} alt="preview" className="w-full h-full object-cover" />
          ) : avatarUrl ? (
            <Image src={avatarUrl} fill={true} alt="avatar" className="w-full h-full object-cover" />
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
      {/* <Button size='sm' variant={stripeID ? "secondary":"destructive"} disabled={stripeID ? true:false} onClick={handleConnectBank} type="button">
        {stripeID ? "เชื่อมต่อบัญชีธนาคารแล้ว":"เชื่อมต่อบัญชีธนาคาร"}
      </Button> */}
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