"use client"
import Link from "next/link";
import { LogInButton } from "./ui/login-button";
import { createClient } from "@/lib/supabase/client";
import { getFirstname, SignOut } from "@/lib/authServices";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const router = useRouter()
  useEffect(()=>{
    async function fetchName(){
      const supabase = createClient();
      const name = await getFirstname(supabase)
      setDisplayName(name);
    }
    fetchName();
  },[])
  const handleLogout = async()=>{
    try{
      const supabase = createClient()
      const check = await SignOut(supabase)
      if (!check){
        toast({
          title: "ออกจากระบบไม่สำเร็จ",
          description: "โปรดลองอีกครั้งภายหลัง",
          variant: "destructive",
        })
        return
      }
      toast({
          title: "ออกจากระบบสำเร็จ",
          description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
          variant: "default",
        })
      router.refresh()
      router.push("/auth/login")
    }catch(err: unknown){
      console.error(err);
    }
  }
  return displayName ? (
    <div className="flex items-center gap-3">
      <Link href="/dashboard"><span className="text-sm text-gray-600 font-medium">สวัสดี, {displayName}!</span></Link>
      <Button variant="link" size="sm" onClick={handleLogout}>ออกจากระบบ</Button>
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

