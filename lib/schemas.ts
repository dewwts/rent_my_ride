import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z
  .object({
    // username:z.string().min(1,"Username is required"),
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
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

export const CarSchema = z.object({
  car_brand: z.string().min(1, "กรุณากรอกยี่ห้อรถ"),
  model: z.string().min(1, "กรุณากรอกรุ่นรถ"),
  car_id: z.string().min(1, "กรุณากรอกหมายเลขทะเบียนรถ"),
  year: z.coerce.number().min(1990, "ปีที่ผลิตต้องไม่ต่ำกว่า 1990").max(new Date().getFullYear() + 1, "ปีที่ผลิตไม่ควรเกินปีปัจจุบัน"),
  number_of_seats: z.coerce.number().min(1, "จำนวนที่นั่งต้องมากกว่า 0").max(50, "จำนวนที่นั่งไม่ควรเกิน 50"),
  car_type: z.string().min(1, "กรุณาเลือกประเภทรถ"),
  color: z.string().min(1, "กรุณากรอกสีรถ"),
  mileage: z.coerce.number().min(0, "เลขไมล์ต้องไม่เป็นลบ").max(999999, "เลขไมล์ไม่ควรเกิน 999,999"),
  oil_type: z.string().min(1, "กรุณาเลือกประเภทเชื้อเพลิง"),
  gear_type: z.string().min(1, "กรุณาเลือกประเภทเกียร์"),
  price_per_day: z.coerce.number().min(1, "ราคาต่อวันต้องมากกว่า 0").max(100000, "ราคาต่อวันไม่ควรเกิน 100,000 บาท"),
  status: z.enum(["available", "unavailable"], {
    message: "กรุณาเลือกสถานะรถ",
  }),
  location: z.string().min(1, "กรุณาเลือกสถานที่"),
  rating: z.coerce.number().min(0).max(5).optional(),
  image_url: z.string().optional(),
});

