// lib/getUserProfile.ts
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface UserProfile {
  u_firstname: string;
  u_lastname: string;
  u_email: string;
  u_phone: string;
  u_address: string;
  subdistrict: string;
  district: string;
  province: string;
  postal_code: string;
  country: string;
  url?: string | null;
}

export async function getUserProfile(userId: string): Promise<{ profileData: UserProfile; profilePictureUrl: string }> {
  const supabase = await createServerClient();

  // Fetch user_info row
  const { data: userInfo, error } = await supabase
    .from("user_info")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error("Failed to fetch user profile");
  }

  // Helper: split address into components
  const splitAddress = (address: string | null) => {
    if (!address)
      return { u_address: "", subdistrict: "", district: "", province: "", postal_code: "", country: "" };
    const parts = address.split("/");
    return {
      u_address: parts[0] || "",
      subdistrict: parts[1] || "",
      district: parts[2] || "",
      province: parts[3] || "",
      postal_code: parts[4] || "",
      country: parts[5] || "",
    };
  };

  // Helper: format phone
  const formatPhone = (phone: string | null) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    return phone;
  };

  // Helper: get profile picture URL
  const getProfilePictureUrl = (profilePicturePath: string | null) => {
    if (!profilePicturePath) return "/twitter-image.png";

    if (profilePicturePath.startsWith("https://")) return profilePicturePath;

    const { data } = supabase.storage.from("profile-pictures").getPublicUrl(profilePicturePath);
    return data.publicUrl;
  };

  const profileData: UserProfile = userInfo
    ? {
        ...userInfo,
        ...splitAddress(userInfo.u_address),
        u_phone: formatPhone(userInfo.u_phone || ""),
      }
    : {
        u_firstname: "",
        u_lastname: "",
        u_email: "",
        u_phone: "",
        url: null,
        ...splitAddress(null),
      };

  const profilePictureUrl = getProfilePictureUrl(userInfo?.url);

  return { profileData, profilePictureUrl };
}
