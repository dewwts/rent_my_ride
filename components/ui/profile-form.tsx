'use client';

import { useState, useRef } from 'react';
import InputField from '@/components/ui/inputfield';
import { ProfileData, uploadProfilePicture, deleteProfilePicture, saveProfile } from '@/lib/profileService';

interface ProfileFormProps {
  initialData: ProfileData;
  userId: string;
  initialProfilePicture: string;
}

export default function ProfileForm({ initialData, userId, initialProfilePicture }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({ ...initialData });
  const [profilePicture, setProfilePicture] = useState(initialProfilePicture);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProfilePictureDeleted, setIsProfilePictureDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = () => fileInputRef.current?.click();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'กรุณาเลือกไฟล์รูปภาพ (.png, .jpg, .jpeg เท่านั้น)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB' });
      return;
    }

    setSelectedFile(file);
    setIsProfilePictureDeleted(false);

    const reader = new FileReader();
    reader.onload = e => setProfilePicture(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteProfilePicture = () => {
    setProfilePicture('/twitter-image.png');
    setSelectedFile(null);
    setIsProfilePictureDeleted(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      let profilePicturePath = initialData.url;

      if (selectedFile) {
        const uploadedPath = await uploadProfilePicture(userId, selectedFile, initialData.url);
        if (!uploadedPath) throw new Error('Failed to upload profile picture');
        profilePicturePath = uploadedPath;
      } else if (isProfilePictureDeleted) {
        await deleteProfilePicture(initialData.url);
        profilePicturePath = null;
      }

      //await saveProfile(userId, formData, profilePicturePath);

      setFormData(prev => ({ ...prev, url: profilePicturePath }));
      setSelectedFile(null);
      setIsProfilePictureDeleted(false);

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
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="border-2 border-[#2B09F7] rounded-[8px]">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 m-5">
          <div className="w-24 h-24 sm:w-[112px] sm:h-[112px] rounded-full overflow-hidden border">
            <img
              src={profilePicture}
              alt="โปรไฟล์"
              className="w-full h-full object-cover"
              onError={(e) => (e.target as HTMLImageElement).src = '/twitter-image.png'}
            />
          </div>
          <div className="flex flex-row gap-2 sm:gap-6 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={handleProfilePictureChange}
              className="px-4 py-2 bg-[#023047] text-white rounded-3xl hover:bg-blue-700 border-2 border-white"
            >
              เปลี่ยนรูปโปรไฟล์
            </button>
            <button
              type="button"
              onClick={handleDeleteProfilePicture}
              className="px-4 py-2 bg-white text-black rounded-3xl hover:bg-red-600 hover:text-white border-2 border-black"
            >
              ลบรูปโปรไฟล์
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </div>

      {/* Profile Form Section */}
      <div className="border-2 border-[#2B09F7] rounded-[8px]">
        {message && (
          <div className={`mx-5 mt-5 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-5">
          {/* Reuse InputField as before */}
          <InputField label="ชื่อ" placeholder="เลิฟรัก" value={formData.u_firstname} onChange={value => handleInputChange('u_firstname', value)} required />
          <InputField label="สกุล" placeholder="สงบใจ" value={formData.u_lastname} onChange={value => handleInputChange('u_lastname', value)} required />
          <InputField label="อีเมล์" type="email" placeholder="example@gmail.com" value={formData.u_email} onChange={value => handleInputChange('u_email', value)} required />
          <InputField label="เบอร์โทรศัพท์" placeholder="0XX-XXX-XXXX" value={formData.u_phone} onChange={value => handleInputChange('u_phone', value)} />
          <InputField label="ที่อยู่" placeholder="170/3 สะพานขาว" value={formData.u_address} onChange={value => handleInputChange('u_address', value)} />
          <InputField label="แขวง / ตำบล" placeholder="สี่พระยา" value={formData.subdistrict} onChange={value => handleInputChange('subdistrict', value)} />
          <InputField label="เขต / อำเภอ" placeholder="บางรัก" value={formData.district} onChange={value => handleInputChange('district', value)} />
          <InputField label="จังหวัด" placeholder="กรุงเทพมหานคร" value={formData.province} onChange={value => handleInputChange('province', value)} />
          <InputField label="รหัสไปรษณีย์" placeholder="10500" value={formData.postal_code} onChange={value => handleInputChange('postal_code', value)} />
          <InputField label="ประเทศ" placeholder="ไทย" value={formData.country} onChange={value => handleInputChange('country', value)} />
        </form>

        <div className="flex justify-center mb-4">
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-3xl border-2 border-black ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-[#023047] hover:text-white'}`}
          >
            {isLoading ? 'กำลังบันทึก...' : 'แก้ไขโปรไฟล์'}
          </button>
        </div>
      </div>
    </div>
  );
}
