import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex flex-row">
            <DashboardSidebar />
            <div className="flex flex-col justify-center items-center w-full">
                <h2 className="text-xl font-bold mb-4">หน้าโปรไฟล์</h2>
                <form className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">ชื่อ</label>
                        <input type="text" placeholder="เลิฟรัก" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">สกุล</label>
                        <input type="text" placeholder="สงบใจ" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">ที่อยู่อีเมล์</label>
                        <input type="email" placeholder="example@gmail.com" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">เบอร์โทรศัพท์</label>
                        <input type="text" placeholder="0XX-XXX-XXXX" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">ที่อยู่</label>
                        <input type="text" placeholder="170/3 สะพานขาว" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">แขวง / ตำบล</label>
                        <input type="text" placeholder="สี่พระยา" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">เขต / อำเภอ</label>
                        <input type="text" placeholder="บางรัก" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">จังหวัด</label>
                        <input type="text" placeholder="กรุงเทพมหานคร" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">รหัสไปรษณีย์</label>
                        <input type="text" placeholder="10500" className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium">ประเทศ</label>
                        <input type="text" placeholder="ไทย" className="border p-2 rounded" />
                    </div>
                    <button className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    แก้ไขโปรไฟล์
                    </button>
                </form>
            </div>
        </div >
      <Footer />
    </div>
  );
}
