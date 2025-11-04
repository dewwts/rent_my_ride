"use client";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { LoginSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthApiError } from "@supabase/supabase-js";
import { toast } from "./ui/use-toast";
import { loginInfo } from "@/types/authInterface";
import { SignIn } from "@/lib/authServices";

type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormValues) => {
    const supabase = createClient();
    const object: loginInfo = data
    setIsLoading(true);
    try{
      await SignIn(object, supabase)
      toast({
        variant:'success',
        title:"สำเร็จ",
        description:"เข้าสู่ระบบสำเร็จ"
      })
      console.log("is pass login");
      router.refresh()
      router.push("/dashboard");
      console.log("after push to dashboard");
    }catch(error: unknown){
      let message = "ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง";
      if (error instanceof AuthApiError) {
        if (
          error.status === 400 ||
          /invalid login credentials/i.test(error.message) ||
          /invalid_credentials/i.test((error as AuthApiError)?.code ?? "")
        ) {
          message = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        } else if (/email not confirmed/i.test(error.message)) {
          message = "ยังไม่ได้ยืนยันอีเมล กรุณาตรวจสอบกล่องจดหมายของคุณ";
        } else if (error.status === 429) {
          message = "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง";
        }
      }
      toast({
        variant:'destructive',
        title:"Sign-in ไม่สำเร็จ",
        description:message
      })
      setError("password", { type: "server", message });
    }finally{
      setIsLoading(false)
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <div
      className={cn("flex items-center justify-center bg-white px-4", className)}
      style={{ minHeight: "calc(100svh - 88px)" }}
      {...props}
    >
      <Card className="w-full max-w-md rounded-xl border border-gray-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-center">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="text-center">
            ใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="email">ที่อยู่อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
                {...register("email")}
                disabled={disabled}
                className="border-gray-300 focus-visible:ring-2 focus-visible:ring-black"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs hover:underline"
                  style={{ color: "#219EBC" }}
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  disabled={disabled}
                  className="border-gray-300 pr-10 focus-visible:ring-2 focus-visible:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                  aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  tabIndex={-1}
                >
                  {showPw ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-full bg-black text-white py-2.5 font-medium hover:bg-gray-900 transition active:scale-[.99]"
            >
              {disabled ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            <p className="mt-2 text-center text-sm">
              ยังไม่มีบัญชีผู้ใช้งาน?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium hover:underline"
                style={{ color: "#219EBC" }}
              >
                ลงทะเบียนเลย
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}