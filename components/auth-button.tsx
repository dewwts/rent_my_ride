import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  await supabase.auth.refreshSession();

  // You can also use getUser() which will be slower.
  //const { data } = await supabase.auth.getUser();
  //const { data } = await supabase.auth.getClaims();
  //const user = data?.user_metadata;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-3">

      <Link href="/dashboard"><span className="text-sm text-gray-600 font-medium">สวัสดี, {user?.user_metadata?.firstname}!</span></Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="ghost">
        <Link href="/auth/login">เข้าสู่ระบบ</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">สมัครสมาชิก</Link>
      </Button>
    </div>
  );
}
