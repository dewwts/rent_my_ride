// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
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
      <main className="min-h-screen grid place-items-center p-6">
        <p className="text-gray-600">กำลังตรวจสอบสิทธิ์เข้าใช้งาน…</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col justify-center min-h-screen p-2 sm:p-5 m-0 sm:m-5">
      <h2 className="text-2xl sm:text-3xl font-semibold mt-3 mb-4 text-center sm:text-left">
        หน้าโปรไฟล์
      </h2>

      {/* ปล่อยให้ ProfileForm แสดง/จัดการรูปโปรไฟล์ทั้งหมด */}
      <div className="border-2 border-[#2B09F7] rounded-[8px] mt-2 mb-8">
        <ProfileForm />
      </div>
    </div>
  );
}
