import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z
  .object({
    // username:z.string().min(1,"Username is required"),
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
    email: z.email().min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ProfileSchema = z.object({
  firstname: z.string().min(1, "กรุณากรอกชื่อ"),
  lastname: z.string().min(1, "กรุณากรอกนามสกุล"),
  email: z.email(), // read-only ใน UI แต่ต้อง valid
  phone: z
    .string()
    .trim()
    .transform((v) => (v ? v.replace(/\D/g, "") : "")) // เก็บเฉพาะตัวเลข
    .refine((v) => v === "" || /^[0-9]{10}$/.test(v), {
      message: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก (หรือปล่อยว่าง)",
    }),
  addr_line: z.string().optional(),
  subdistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});