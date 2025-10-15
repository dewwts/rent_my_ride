import { SupabaseClient } from "@supabase/supabase-js";

export const getFirstname = async (supabase: SupabaseClient, id:string) => {
    const {data,error} = await supabase
        .from("user_info")
        .select()
        .eq("user_id",id)
        .single();

    if(error) throw error;
    return data.u_firstname
};