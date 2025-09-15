"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;

      if (error || !data?.user) {
        router.push("/auth/login");
        return;
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p className="text-gray-600">กำลังตรวจสอบสิทธิ์เข้าใช้งาน…</p>
      </main>
    );
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
              <Button size="sm">ดูการจองรถ</Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-2">
                ค้นหารถ
              </h3>
              <p className="text-gray-600 mb-4">ค้นหารถที่ต้องการจอง</p>
              <Button size="sm">ค้นหารถ</Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-2">
                ข้อมูลส่วนตัวของฉัน
              </h3>
              <p className="text-gray-600 mb-4">อัพเดตข้อมูลส่วนตัวของคุณ</p>
              <Button size="sm" onClick={() => router.push("/dashboard/profile")}>
                แก้ไขข้อมูลส่วนตัว
              </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-2">
                ประวัติธุรกรรม
              </h3>
              <p className="text-gray-600 mb-4">เข้าถึงประวัติธุรกรรม</p>
              <Button size="sm" onClick={() => router.push("/dashboard/history")}>
              ประวัติธุรกรรม
              </Button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
