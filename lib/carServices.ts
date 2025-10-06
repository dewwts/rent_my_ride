import { SupabaseClient } from "@supabase/supabase-js";
import { uploadImage } from "./utils";

export const uploadImageCar = async(supabase: SupabaseClient, file: File, carid:string)=>{
    try{
        const mubucket = 'car'
        const {data: sessionData} =await supabase.auth.getUser()
        const user = sessionData?.user
        if (!user){
            throw new Error("โปรดเข้าสู่ระบบก่อน")
        }
        const publicUrl = await uploadImage(mubucket, user.id, file, supabase)
        const {error: dbErr} = await supabase.from('car_information').upsert({
            car_id:carid,
            car_image:publicUrl
        })
        if (dbErr){
            throw new Error("เกิดความขัดข้องกับระบบ")
        }
        return publicUrl
    }catch(err:unknown){
        let message = "Something went wrong"
        if (err instanceof Error){
            message = err.message
        }
        throw new Error(message)
    }
}