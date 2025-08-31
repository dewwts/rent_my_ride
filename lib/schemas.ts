import {z} from 'zod'

export const LoginSchema = z.object({
    email:z.email().min(1,"Email is required"),
    password:z.string().min(1, "Password is required")
})

export const RegisterSchema = z.object({
    // username:z.string().min(1,"Username is required"),
    firstname:z.string().min(1,"Firstname is required"),
    lastname:z.string().min(1,"Lastname is required"),
    email:z.email().min(1, "Email is required"),
    password:z.string().min(6,"Password must be at least 6 characters"),
    confirmPassword:z.string()
})
.refine((data)=> data.password === data.confirmPassword,{
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const ProfileSchema = z.object({
    firstname:z.string().min(1,"Firstname is required"),
    lastname:z.string().min(1,"Lastname is required"),
    phone:z.string().regex(/^0\d{9}$/,
        "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลักขึ้นต้นด้วย 0)"
    ),
    address:z.string().min(1,"Address is required")
})