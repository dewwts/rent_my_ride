import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard-sidebar";
import InputField from "@/components/ui/inputfield"

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col justify-center min-h-screen p-2 sm:p-5 m-0 sm:m-5">
        <h2 className="text-2xl sm:text-3xl font-semibold mt-3 mb-4 text-center sm:text-left">หน้าโปรไฟล์</h2>
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

        <div className="border-2 border-[#2B09F7] rounded-[8px] mt-2 mb-8">
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-5">
            <InputField label="ชื่อ" placeholder="เลิฟรัก" />
            <InputField label="สกุล" placeholder="สงบใจ" />
            <InputField label="ที่อยู่อีเมล์" type="email" placeholder="example@gmail.com" />
            <InputField label="เบอร์โทรศัพท์" placeholder="0XX-XXX-XXXX" />
            <InputField label="ที่อยู่" placeholder="170/3 สะพานขาว" />
            <InputField label="แขวง / ตำบล" placeholder="สี่พระยา" />
            <InputField label="เขต / อำเภอ" placeholder="บางรัก" />
            <InputField label="จังหวัด" placeholder="กรุงเทพมหานคร" />
            <InputField label="รหัสไปรษณีย์" placeholder="10500" />
            <InputField label="ประเทศ" placeholder="ไทย" />
        </form>
        <div className="flex justify-center mb-4">
            <button className="px-6 py-2 bg-white text-black rounded-3xl border-2 border-black hover:bg-[#023047] hover:text-white">
            แก้ไขโปรไฟล์
            </button>
        </div>
        </div>
    </div>
 );
}
