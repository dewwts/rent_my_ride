"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {z} from 'zod'
import { RegisterSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthResponse } from "@supabase/supabase-js";
import { toast } from "./ui/use-toast";

type RegisterFormValues = z.infer<typeof RegisterSchema>

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {register, handleSubmit, formState:{errors}} = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema)
  })
  const handleSignUp = async (data: RegisterFormValues) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { data: user} = await supabase.from('user_info').select('u_email').eq('u_email', data.email).single();
      if (user){throw new Error('Email already exists');}
      const { error } = await supabase.auth.signUp({
        email:data.email,
        password:data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            firstname: data.firstname,
            lastname: data.lastname,
            role: 'user'
          },
        },
      });
      if (error) throw error;
      setIsLoading(false);
      
      router.push("/auth/sign-up-success");
    } catch (error: any) {
      console.log(error);
      let err;
      if (error instanceof Error){
        setError(error.message);
        err = error.message
      }else{
        setError("An error occurred");
        err = "An error occurred"
      }
      toast({
        variant:"destructive",
        title:"Sign up ไม่สำเร็จ",
        description: err
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">สร้างบัญชี</CardTitle>
          <CardDescription>สร้างบัญชีผู้ใช้งานใหม่</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSignUp)}>
             <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstname">ชื่อจริง</Label>
                <Input id="firstname" {...register('firstname')} />
                {errors.firstname && <p className="text-red-500">{errors.firstname.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">นามสกุล</Label>
                <Input id="lastname" {...register('lastname')} />
                {errors.lastname && <p className="text-red-500">{errors.lastname.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-6 mt-5">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                />
                {(errors.password) && <p className="text-red-500">{errors.password?.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">ยืนยันรหัสผ่าน</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "กำลังสร้างบัญชี..." : "ลงทะเบียน"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                เข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}