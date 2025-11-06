import { SupabaseClient } from "@supabase/supabase-js";
import { uploadImage } from "./utils";
import { Car } from "@/types/carInterface";


export const uploadImageCar = async (
  supabase: SupabaseClient,
  file: File,
  carid: string
) => {
  try {
    const mubucket = "car";
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }
    const publicUrl = await uploadImage(mubucket, user.id, file, supabase);
    // console.log(publicUrl);
    const { error: dbErr } = await supabase
      .from("car_information")
      .update({
        car_image: publicUrl,
      })
      .eq("car_id", carid);
    if (dbErr) {
      throw new Error("เกิดความขัดข้องกับระบบ");
    }
    return publicUrl;
  } catch (err: unknown) {
    let message = "Something went wrong";
    console.error(err);
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

// Get all cars for a user (My Listings)
export const getMyCars = async (supabase: SupabaseClient): Promise<Car[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { data, error } = await supabase
      .from("car_information")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลรถ");
    }
    const castedCar: Car[] = data.map((car) => {
      return {
        ...car,
        year: car.year_created,
        rating: car.car_conditionrating,
      };
    });
    return castedCar || [];
  } catch (err: unknown) {
    let message = "Something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
};

// Get single car by ID
export const getCarById = async (
  supabase: SupabaseClient,
  carId: string
): Promise<Car | null> => {
  try {
    const { data, error } = await supabase
      .from("car_information")
      .select("*")
      .eq("car_id", carId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
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
export const createCar = async (
  supabase: SupabaseClient,
  carData: Omit<Car, "id" | "created_at" | "updated_at">
): Promise<Car> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }
    console.log(carData);
    const { data, error } = await supabase
      .from("car_information")
      .insert({
        car_brand: carData.car_brand,
        model: carData.model,
        // car_id: carData.car_id,
        mileage: carData.mileage,
        year_created: carData.year_created,
        number_of_seats: carData.number_of_seats,
        gear_type: carData.gear_type,
        oil_type: carData.oil_type,
        daily_rental_price: carData.daily_rental_price,
        status: carData.status,
        location: carData.location,
        car_conditionrating: carData.rating || 1,
        car_image: carData.car_image || null,
        owner_id: user.id,
      })
      .select()
      .single();
    console.log(data);
    if (error) {
      throw new Error(error.message);
    }

    return data as Car;
  } catch (err: unknown) {
    throw new Error(
      err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเพิ่มรถ"
    );
  }
};

// Update car
export const updateCar = async (
  supabase: SupabaseClient,
  carId: string,
  // carData: Omit<Car, 'id' | 'created_at' | 'updated_at'>
  carData: Car
): Promise<Car> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { data, error } = await supabase
      .from("car_information")
      .update({
        car_brand: carData.car_brand,
        model: carData.model,
        // car_id: carData.car_id,
        mileage: carData.mileage,
        year_created: carData.year_created,
        number_of_seats: carData.number_of_seats,
        gear_type: carData.gear_type,
        oil_type: carData.oil_type,
        daily_rental_price: carData.daily_rental_price,
        status: carData.status,
        location: carData.location,
        car_conditionrating: carData.rating || 1,
        car_image: carData.car_image || null,
        owner_id: user.id,
      })
      .eq("car_id", carId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
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

//Parital UpdateCar
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/server";
import { NextRequest,NextResponse } from "next/server";
import { isAdmin } from "./authServices";
const ALLOWED_KEYS = [
    'car_brand',
  'model',
  'mileage',
  'year_created',
  'number_of_seats',
  'gear_type',
  'oil_type',
  'daily_rental_price',
  'status',
  'location',
  'car_conditionrating',
  'car_image',
] as const
type AllowedKey = (typeof ALLOWED_KEYS)[number]

// เลือกเฉพาะคีย์ที่ไม่เป็น undefined กับ null
function pickDefined<T extends Record<string, any>>(src: T, keys: readonly string[]) {
  const out: Record<string, any> = {}
  for (const k of keys) {
    if (src[k] !== undefined && src[k] !== null) out[k] = src[k]
  }
  return out
}

export async function PATCH(req:NextRequest,{params}:{params:{carID:string}}){
  try{
    const supabase =await createClient();
    const is_admin = await isAdmin(supabase);
    const admin = createAdminClient()
    if (!is_admin){
            return NextResponse.json({success: false, error: "ผู้ใช้ไม่ได้รับอนุญาตให้เข้าถึง"},{status:401})
    }
    const carID = params.carID;
    const body = await req.json();
    const patch = pickDefined(body, ALLOWED_KEYS as unknown as string[]) as Partial<Record<AllowedKey, any>>
    const{data,error} = await admin
    .from('car_information')
    .update(patch)
    .eq('car_id', carID)
    .select()
    .single();

    if(error){
      console.error("Update error : ", error);
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  }catch(err){
    console.error('update car error:', err)
  }
}




// Delete car
export const deleteCar = async (
  supabase: SupabaseClient,
  carId: string
): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      throw new Error("โปรดเข้าสู่ระบบก่อน");
    }

    const { error } = await supabase
      .from("car_information")
      .delete()
      .eq("car_id", carId)
      .eq("owner_id", user.id); // Ensure user can only delete their own cars

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

export const carAvailable = async (
  supabase: SupabaseClient,
  carid: string,
  startAt: Date,
  endAt: Date
) => {
  try {
    if (!(startAt instanceof Date) || !(endAt instanceof Date)) {
      throw new Error("รูปแบบวันที่ไม่ถูกต้อง");
    }
    if (startAt > endAt) {
      throw new Error("วันเริ่มต้องไม่เกินวันสิ้นสุด");
    }
    const startISO = startAt.toISOString();
    const endISO = endAt.toISOString();
    console.log(
      "Checking availability for car:",
      carid,
      "from",
      startISO,
      "to",
      endISO
    );
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData.user) {
      throw new Error("User not authenticated");
    }

    const { data: carData, error } = await supabase
      .from("renting")
      .select("renting_id, sdate, edate")
      .eq("car_id", carid)
      .lte("sdate", endISO)
      .gte("edate", startISO);

    if (error) {
      throw error;
    }
    const available = carData.length === 0;
    return available;
  } catch (err: unknown) {
    console.log(err);
    return false;
  }
};

export const getCarStatus = async(supabase: SupabaseClient, car_id:string)=>{
  const {data, error:err} = await supabase.from("car_information").select("status").eq("car_id", car_id).single()
  if (err){
    throw new Error("เกิดปัญหาในการเข้าถึงฐานข้อมูล")
  }
  return data.status
}

