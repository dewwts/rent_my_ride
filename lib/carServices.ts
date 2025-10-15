import { SupabaseClient } from "@supabase/supabase-js";
import { uploadImage } from "./utils";
import { Car } from "@/types/carInterface";

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

// Get all cars for a user (My Listings)
export const getMyCars = async (supabase: SupabaseClient): Promise<Car[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    
    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { data, error } = await supabase
      .from('car_information')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลรถ");
    }

    return data || [];
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

// Get single car by ID
export const getCarById = async (supabase: SupabaseClient, carId: string): Promise<Car | null> => {
  try {
    const { data, error } = await supabase
      .from('car_information')
      .select('*')
      .eq('car_id', carId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Car not found
      }
      throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลรถ");
    }

    return data;
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

// Create new car
export const createCar = async (supabase: SupabaseClient, carData: Omit<Car, 'id' | 'created_at' | 'updated_at'>): Promise<Car> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    
    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { data, error } = await supabase
      .from('car_information')
      .insert({
        ...carData,
        owner_id: user.id,
        rating: carData.rating || 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error("เกิดข้อผิดพลาดในการเพิ่มรถ");
    }

    return data;
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

// Update car
export const updateCar = async (supabase: SupabaseClient, carId: string, carData: Partial<Omit<Car, 'id' | 'created_at' | 'updated_at'>>): Promise<Car> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    
    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { data, error } = await supabase
      .from('car_information')
      .update({
        ...carData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', carId)
      .eq('owner_id', user.id) // Ensure user can only update their own cars
      .select()
      .single();

    if (error) {
      throw new Error("เกิดข้อผิดพลาดในการอัปเดตรถ");
    }

    return data;
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

// Delete car
export const deleteCar = async (supabase: SupabaseClient, carId: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    
    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { error } = await supabase
      .from('car_information')
      .delete()
      .eq('id', carId)
      .eq('owner_id', user.id); // Ensure user can only delete their own cars

    if (error) {
      throw new Error("เกิดข้อผิดพลาดในการลบรถ");
    }
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

export const carAvailable = async(supabase: SupabaseClient, carid:string, startAt:Date, endAt:Date)=>{
    try{
         if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
            throw new Error("รูปแบบวันที่ไม่ถูกต้อง");
        }
        if (startAt > endAt) {
            throw new Error("วันเริ่มต้องไม่เกินวันสิ้นสุด");
      }
        const startISO = startAt.toISOString();
        const endISO = endAt.toISOString();
        console.log("Checking availability for car:", carid, "from", startISO, "to", endISO);
        const {data: sessionData} = await supabase.auth.getUser();
        if (!sessionData.user) {
            throw new Error("User not authenticated");
        }

        const {data: carData, error} = await supabase
        .from("renting")
        .select("renting_id, sdate, edate")
        .eq("car_id", carid)
        .gt("edate", startISO) // edate > start
        .lt("sdate", endISO) // sdate < end

        if (error) {
            throw error;
        }

        const available = carData.length === 0;
        return available;
    }catch(err: unknown){
        console.log(err)
        return false;
    }
}
