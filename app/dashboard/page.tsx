"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/authServices";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

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

      //check admin
      const admin = await isAdmin(supabase);
      if (!mounted) return;
      setRole(admin ? "admin" : "user");

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
            {role === "user" && (
              <p className="text-gray-600">
                จัดการการจองรถของคุณทั้งการปล่อยเช่าและจอง
              </p>
            )}
            {role === "admin" && (
              <p className="text-gray-600">
                จัดการข้อมูลคำสั่งซื้อเเละดูเเลผู้ใช้งานระบบ
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-2">
                ข้อมูลส่วนตัวของฉัน
              </h3>
              <p className="text-gray-600 mb-4">อัพเดตข้อมูลส่วนตัวของคุณ</p>
              <Button size="sm" onClick={() => router.push("/dashboard/profile")}>
                แก้ไขข้อมูลส่วนตัว
              </Button>
            </div>

            {role === "user" && (
              <>
                {/* การเช่ารถของฉัน */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    การเช่ารถของฉัน
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ดูประวัติการเช่ารถของคุณ
                  </p>
                  <Button size="sm" onClick={() => router.push("/dashboard/bookings")}>
                    ดูการเช่ารถ
                  </Button>
                </div>

                {/* ค้นหารถ */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    ค้นหารถ
                  </h3>
                  <p className="text-gray-600 mb-4">ค้นหารถที่ต้องการจอง</p>
                  <Button size="sm" onClick={() => router.push("/")}>
                    ค้นหารถ
                  </Button>
                </div>

                {/* ประวัติการให้เช่า */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    ประวัติการให้เช่า
                  </h3>
                  <p className="text-gray-600 mb-4">ดูประวัติการปล่อยเช่ารถของคุณ</p>
                  <Button size="sm" onClick={() => router.push("/dashboard/rentings")}>
                    ประวัติการให้เช่า
                  </Button>
                </div>

                {/* รถของฉัน */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    รถของฉัน
                  </h3>
                  <p className="text-gray-600 mb-4">เข้าถึงรถที่คุณปล่อยเช่าทั้งหมด</p>
                  <Button size="sm" onClick={() => router.push("/dashboard/cars")}>
                    รถของฉัน
                  </Button>
                </div>
              </>
            )}

            {role === "admin" && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    ดูคำสั่งซื้อทั้งหมด
                  </h3>
                  <p className="text-gray-600 mb-4">ดูและจัดการคำสั่งซื้อทั้งหมดในระบบ</p>
                  <Button size="sm" onClick={() => router.push("/dashboard/history")}>
                    ดูคำสั่งซื้อทั้งหมด
                  </Button>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
