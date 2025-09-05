"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/logout-button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button
      onClick={logout}
      variant="ghost"
      className="flex items-center gap-2 text-base font-medium hover:underline"
    >
      ออกจากระบบ
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
}
