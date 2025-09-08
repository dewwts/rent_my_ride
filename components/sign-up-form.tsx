"use client";

import * as React from "react";
import type { HTMLAttributes } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { RegisterSchema } from "@/lib/schemas";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ✅ ใช้ toast ของ shadcn/ui
import { useToast } from "@/components/ui/use-toast";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export function SignUpForm({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const email = data.email.trim().toLowerCase();

      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            firstname: data.firstname,
            lastname: data.lastname,
            role: "user",
          },
        },
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (
          msg.includes("already") ||
          msg.includes("exists") ||
          msg.includes("registered") ||
          msg.includes("duplicate")
        ) {
          toast({
            title: "อีเมลนี้ถูกใช้แล้ว",
            description: "กรุณาเข้าสู่ระบบแทน",
            variant: "destructive", // สีแดง
          });
          return;
        }
        throw error;
      }

      const identitiesLen =
        (signUpData?.user as any)?.identities?.length ?? null;

      if (identitiesLen === 0) {
        toast({
          title: "อีเมลนี้ถูกใช้แล้ว",
          description: "กรุณาเข้าสู่ระบบแทน",
          variant: "destructive",
        });
        return;
      }

      router.push("/auth/sign-up-success");
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err instanceof Error ? err.message : "ไม่สามารถสมัครได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">สร้างบัญชี</CardTitle>
          <CardDescription>สร้างบัญชีผู้ใช้งานใหม่</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstname">ชื่อจริง</Label>
                <Input
                  id="firstname"
                  {...register("firstname")}
                  autoComplete="given-name"
                  disabled={disabled}
                />
                {errors.firstname && (
                  <p className="text-red-500 text-sm">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">นามสกุล</Label>
                <Input
                  id="lastname"
                  {...register("lastname")}
                  autoComplete="family-name"
                  disabled={disabled}
                />
                {errors.lastname && (
                  <p className="text-red-500 text-sm">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  {...register("email")}
                  disabled={disabled}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  disabled={disabled}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  disabled={disabled}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={disabled}>
                {disabled ? "กำลังสร้างบัญชี..." : "ลงทะเบียน"}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/sign-in" className="underline underline-offset-4">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
