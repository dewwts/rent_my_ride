'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import InputField from '@/components/ui/inputfield';

interface ProfileData {
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
}

interface ProfileFormProps {
  initialData: ProfileData;
  userId: string;
}

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<ProfileData>({ ...initialData });

  const supabase = createClient();

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Concatenate 6 segments into u_address
    const fullAddress = `${formData.u_address}/${formData.subdistrict}/${formData.district}/${formData.province}/${formData.postal_code}/${formData.country}`;

    // Clean phone number (remove dashes)
    const cleanedPhone = formData.u_phone.replace(/\D/g, '');

    const profileDataToSave = {
      u_firstname: formData.u_firstname,
      u_lastname: formData.u_lastname,
      u_email: formData.u_email,
      u_phone: cleanedPhone || null,
      u_address: fullAddress || null,
    };

    try {
      const { data: existingProfile } = await supabase
        .from('user_info')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let result;
      if (existingProfile) {
        result = await supabase
          .from('user_info')
          .update(profileDataToSave)
          .eq('user_id', userId);
      } else {
        result = await supabase
          .from('user_info')
          .insert({
            user_id: userId,
            ...profileDataToSave,
          });
      }

      if (result.error) throw result.error;

      setMessage({ type: 'success', text: 'บันทึกข้อมูลโปรไฟล์สำเร็จ!' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-2 border-[#2B09F7] rounded-[8px] mt-2 mb-8">
      {message && (
        <div
          className={`mx-5 mt-5 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-5">
        <InputField
          label="ชื่อ"
          placeholder="เลิฟรัก"
          value={formData.u_firstname}
          onChange={(value) => handleInputChange('u_firstname', value)}
          required
        />
        <InputField
          label="สกุล"
          placeholder="สงบใจ"
          value={formData.u_lastname}
          onChange={(value) => handleInputChange('u_lastname', value)}
          required
        />
        <InputField
          label="อีเมล์"
          type="email"
          placeholder="example@gmail.com"
          value={formData.u_email}
          onChange={(value) => handleInputChange('u_email', value)}
          required
        />
        <InputField
          label="เบอร์โทรศัพท์"
          placeholder="0XX-XXX-XXXX"
          value={formData.u_phone}
          onChange={(value) => handleInputChange('u_phone', value)}
        />
        <InputField
          label="ที่อยู่"
          placeholder="170/3 สะพานขาว"
          value={formData.u_address}
          onChange={(value) => handleInputChange('u_address', value)}
        />
        <InputField
          label="แขวง / ตำบล"
          placeholder="สี่พระยา"
          value={formData.subdistrict}
          onChange={(value) => handleInputChange('subdistrict', value)}
        />
        <InputField
          label="เขต / อำเภอ"
          placeholder="บางรัก"
          value={formData.district}
          onChange={(value) => handleInputChange('district', value)}
        />
        <InputField
          label="จังหวัด"
          placeholder="กรุงเทพมหานคร"
          value={formData.province}
          onChange={(value) => handleInputChange('province', value)}
        />
        <InputField
          label="รหัสไปรษณีย์"
          placeholder="10500"
          value={formData.postal_code}
          onChange={(value) => handleInputChange('postal_code', value)}
        />
        <InputField
          label="ประเทศ"
          placeholder="ไทย"
          value={formData.country}
          onChange={(value) => handleInputChange('country', value)}
        />
      </form>

      <div className="flex justify-center mb-4">
        <button
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit}
          className={`px-6 py-2 rounded-3xl border-2 border-black ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-[#023047] hover:text-white'
          }`}
        >
          {isLoading ? 'กำลังบันทึก...' : 'แก้ไขโปรไฟล์'}
        </button>
      </div>
    </div>
  );
}
