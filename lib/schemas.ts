import {z} from 'zod'

export const LoginSchema = z.object({
    email:z.email().min(1,"Email is required"),
    password:z.string().min(1, "Password is required")
})

export const RegisterSchema = z.object({
    // username:z.string().min(1,"Username is required"),
    email:z.email().min(1, "Email is required"),
    password:z.string().min(6,{message:"Password must be at least 6 characters"}),
    confirmPassowrd:z.string()
})
.refine((data)=> data.password === data.confirmPassowrd,{
    message: "Passwords do not match",
    path: ["password_2"],
})