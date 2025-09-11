import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface ProfileData {
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

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_info')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as ProfileData;
};

export const uploadProfilePicture = async (userId: string, file: File, existingUrl?: string | null) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    if (existingUrl) {
      await supabase.storage.from('profile-pictures').remove([existingUrl]);
    }

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;
    return filePath;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
};

export const deleteProfilePicture = async (url?: string | null) => {
  if (!url || url.startsWith('https://')) return;
  try {
    await supabase.storage.from('profile-pictures').remove([url]);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
  }
};

export const saveProfile = async (userId: string, formData: ProfileData, profilePicturePath: string | null) => {
  const fullAddress = `${formData.u_address}/${formData.subdistrict}/${formData.district}/${formData.province}/${formData.postal_code}/${formData.country}`;
  const cleanedPhone = formData.u_phone.replace(/\D/g, '');

  const profileDataToSave = {
    u_firstname: formData.u_firstname,
    u_lastname: formData.u_lastname,
    u_email: formData.u_email,
    u_phone: cleanedPhone || null,
    u_address: fullAddress || null,
    url: profilePicturePath,
  };

  const { data: existingProfile, error: selectError } = await supabase
    .from('user_info')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') throw selectError; // Ignore "no rows" error

  if (existingProfile) {
    const { error } = await supabase
      .from('user_info')
      .update(profileDataToSave)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_info')
      .insert({ user_id: userId, ...profileDataToSave });
    if (error) throw error;
  }

  return profileDataToSave;
};
