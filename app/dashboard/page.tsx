import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
              แดชบอร์ดของฉัน
          </h1>
          <p className="text-gray-600">
            จัดการการจองรถของคุณทั้งการปล่อยเช่าและจอง
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-2">
              การจองรถของฉัน
            </h3>
            <p className="text-gray-600 mb-4">
              ดูและจัดการการจองรถของคุณทั้งหมด
            </p>
            <Button variant="default" size="sm">
              ดูการจองรถ
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-2">
              ค้นหารถ
            </h3>
            <p className="text-gray-600 mb-4">
              ค้นหารถที่ต้องการจอง
            </p>
            <Button variant="default" size="sm">
              ค้นหารถ
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-2">
              ข้อมูลส่วนตัวของฉัน
            </h3>
            <p className="text-gray-600 mb-4">
              อัพเดตข้อมูลส่วนตัวของคุณ
            </p>
            <Button variant="default" size="sm">
              แก้ไขข้อมูลส่วนตัว
            </Button>
          </div>
        </div>

        
        </div>
      </main>
    </div>
  );
}