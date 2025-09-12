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
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;

      if (error || !data?.user) {
        // ไม่มี session → ส่งไปหน้า login
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

      {/* Avatar Card */}
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
        <ProfileForm />
      </div>
    </div>
  );
}
