// app/profile/page.tsx
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard-sidebar";
import ProfileForm from "@/components/ui/profile-form";
import { getUserProfile } from "@/lib/getUserProfile";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/auth/login");
  }

  const { profileData, profilePictureUrl } = await getUserProfile(authData.user.id);

  return (
    <div className="flex flex-col justify-center min-h-screen p-2 sm:p-5 m-0 sm:m-5">
      <h2 className="text-2xl sm:text-3xl font-semibold mt-3 mb-4 text-center sm:text-left">หน้าโปรไฟล์</h2>
      <ProfileForm
        initialData={profileData}
        userId={authData.user.id}
        initialProfilePicture={profilePictureUrl}
      />
    </div>
  );
}
