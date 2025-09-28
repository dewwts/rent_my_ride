"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOutButton } from "@/components/ui/logout-button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SignOut } from "@/lib/authServices";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await SignOut(supabase)
    router.push("/");
  };

  return <LogOutButton onClick={logout} variant="ghost" size="lg">
    ออกจากระบบ
  <ArrowRight className="w-4 h-4" />
  </LogOutButton>;
}