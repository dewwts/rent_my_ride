import Link from "next/link";
import { LogInButton } from "./ui/login-button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;


  return user ? (
    <div className="flex items-center gap-3">

      <Link href="/dashboard"><span className="text-sm text-gray-600 font-medium">สวัสดี, {user?.user_metadata?.firstname}!</span></Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <LogInButton asChild size="default" variant="ghost">
        <Link href="/auth/login">เข้าสู่ระบบ</Link>
      </LogInButton>
      <LogInButton asChild size="default" variant="ghost">
        <Link href="/auth/sign-up">ลงทะเบียน</Link>
      </LogInButton>
    </div>
  );
}
