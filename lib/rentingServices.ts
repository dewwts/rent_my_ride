import { SupabaseClient } from "@supabase/supabase-js";
import { rentingInfo, RentingStatus } from "@/types/rentingInterface";
import { isAdmin } from "./authServices";

// Get all renting
export const getMyRentingHistory = async (supabase: SupabaseClient) => {
  //Check login
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");
  }

  const { data, error } = await supabase
    .from("renting")
    .select(`
      renting_id,
      car_id,
      sdate,
      edate,
      status,
      car_information(
        car_id,
        owner_id
      )
    `)
    .eq("lessee_id",user.id)
    .order("sdate",{ascending:false}); //เรียงจากใหม่สุดไปเก่าสุด

  if (error) throw error;
  return data;
};

//Get renting with id
export const getRentingById = async (supabase: SupabaseClient, id: string) => {
  //Check login
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");
  }
  
  const {data , error} = await supabase
    .from("renting")
    .select()
    .eq("renting_id",id)
    .single();

  if(error) throw error;
  return data;
}

//create renting
export const createRenting = async (
  supabase : SupabaseClient,
  payload : Omit<rentingInfo, 'renting_id' | 'created_at' | 'lessee_id' | 'status'>
) => {
  const {data: { user }} = await supabase.auth.getUser();
  if (!user) throw new Error("ไม่พบผู้ใช้งานนี้ในฐานข้อมูล");

  const insertPayload = {
    ...payload,
    lessee_id: user.id, // uid ของผู้ใช้งาน
    status : "Pending"
  };

  const {data , error} = await supabase
    .from("renting")
    .insert(insertPayload)
    .select()
    .single()

  if(error) throw error
  return data;
}

//update renting (for admin)
export const updateRenting = async (
  supabase : SupabaseClient, 
  renting_id: string, 
  payload: Partial<Omit<rentingInfo, 'renting_id' | 'created_at' | 'lessee_id'>>
) => {
  if(!isAdmin(supabase)) throw new Error("Not allowed to access");
  const {data,error} = await supabase
    .from("renting")
    .update(payload)
    .eq("renting_id",renting_id)
    .select()
    .single()

  if(error) throw error
  return data;
}

//delete Renting (for admin)
export const deleteRenting = async (
  supabase : SupabaseClient,
  renting_id : string
) => {
  if(!isAdmin(supabase)) throw new Error("Not allowed to access");
  const {error} = await supabase
    .from("renting")
    .delete()
    .eq("renting_id",renting_id)

  if(error) throw error;
  return true;
}

//set renting status
export const setRentingStatus = async (supabase : SupabaseClient , renting_id:string, status:RentingStatus) => {
  return updateRenting(supabase,renting_id,{ status });
}

export const getRentingPrice = async (supabase : SupabaseClient, renting_id:string) => {
  const {data,error} = await supabase
    .from("transactions")
    .select("amount")
    .eq("renting_id",renting_id)
    .single();
    
    if(error) throw error;
    return data.amount;
}

<<<<<<< HEAD
export const generateUUID = async(supabase: SupabaseClient)=>{
  const {data: uuid, error:err} = await  supabase.rpc('generate_uuid')
  if (err){
    throw new Error("เกิดความผิดพลาดกับระบบฐานข้อมูล")
  }
  return uuid as string
}

=======
export const getMyLeasingHistory = async (supabase : SupabaseClient) => {
  const {data: { user }} = await supabase.auth.getUser();
  if (!user) throw new Error("ไม่พบสถานะการเข้าสู่ระบบ");
  const {data,error} = await supabase
    .from("car_information")
    .select(`
      car_id,
      renting(
        renting_id,
        lessee_id,
        sdate,
        edate,
        status
      )
    `)
    .eq("owner_id",user.id);
    
    if(error) throw error;

    const rentings = data.flatMap(car =>
    car.renting.map(r => ({
        ...r,
        car_id: car.car_id 
      }))
    );

  return rentings;
}
>>>>>>> 6eb82a3f3fcebd7764c7e0b6c6940a0a0742c3a8
