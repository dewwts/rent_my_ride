import { SupabaseClient } from "@supabase/supabase-js";
import { rentingInfo } from "@/types/rentingInterface";

// Get all renting
export const getRentings = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("renting")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

//Get renting with id
export const getRentingById = async (supabase: SupabaseClient, id: string) => {
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
  payload : Omit<rentingInfo, 'renting_id' | 'created_at' | 'lessee_id'>
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ไม่พบผู้ใช้งานนี้ในฐานข้อมูล");

  const insertPayload = {
    ...payload,
    lessee_id: user.id, // uid ของผู้ใช้งาน
  };

  const {data , error} = await supabase
    .from("renting")
    .insert(insertPayload)
    .select()
    .single()

  if(error) throw error
  return data;
}

//update renting
export const updateRenting = async (
  supabase : SupabaseClient, 
  renting_id: string, 
  payload: Partial<Omit<rentingInfo, 'renting_id' | 'created_at' | 'lessee_id'>>
) => {
  const {data,error} = await supabase
    .from("renting")
    .update(payload)
    .eq("renting_id",renting_id)
    .select()
    .single()
}

//set renting status
export const setRentingStatus = async (supabase : SupabaseClient , renting_id:string, status:string) => {
  return updateRenting(supabase,renting_id,{ status });
}