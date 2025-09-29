import Link from "next/link";
import { LogInButton } from "./ui/login-button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { getFirstname } from "@/lib/authServices";

export async function AuthButton() {
  const supabase = await createClient();
  await supabase.auth.refreshSession();
  let displayName = null
  try{
    const name = await getFirstname(supabase)
    displayName = name;
  }catch(err: unknown){
    console.error(err)
  }
  
  return displayName ? (
    <div className="flex items-center gap-3">
      <Link href="/dashboard"><span className="text-sm text-gray-600 font-medium">สวัสดี, {displayName}!</span></Link>
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

