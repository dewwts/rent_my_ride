import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ProfileForm from "@/components/ui/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/auth/login");
  }

  const { data: userInfo } = await supabase
    .from('user_info')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();

  const splitAddress = (address: string | null) => {
    if (!address) return { u_address: '', subdistrict: '', district: '', province: '', postal_code: '', country: '' };
    const parts = address.split('/');
    return {
      u_address: parts[0] || '',
      subdistrict: parts[1] || '',
      district: parts[2] || '',
      province: parts[3] || '',
      postal_code: parts[4] || '',
      country: parts[5] || '',
    };
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}`;
    return phone;
  };

  const profileData = userInfo
    ? { 
        ...userInfo, 
        ...splitAddress(userInfo.u_address),
        u_phone: formatPhone(userInfo.u_phone || ''),
      }
    : {
        u_firstname: '',
        u_lastname: '',
        u_email: authData.user.email || '',
        u_phone: '',
        ...splitAddress(null),
      };

  return (
    <div className="flex flex-col justify-center min-h-screen p-2 sm:p-5 m-0 sm:m-5">
      <h2 className="text-2xl sm:text-3xl font-semibold mt-3 mb-4 text-center sm:text-left">หน้าโปรไฟล์</h2>
      
      {/* Profile Picture Section */}
      <div className="border-2 border-[#2B09F7] rounded-[8px] mt-2 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 m-5">
          <div className="w-24 h-24 sm:w-[112px] sm:h-[112px] rounded-full overflow-hidden border">
            <img
              src="/twitter-image.png"
              alt="โปรไฟล์"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-row gap-2 sm:gap-6 mt-4 sm:mt-0">
            <button className="px-4 py-2 bg-[#023047] text-white rounded-3xl hover:bg-blue-700 border-2 border-white">
              เปลี่ยนรูปโปรไฟล์
            </button>
            <button className="px-4 py-2 bg-white text-black rounded-3xl hover:bg-red-600 hover:text-white border-2 border-black">
              ลบรูปโปรไฟล์
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm initialData={profileData} userId={authData.user.id} />
    </div>
  );
}
