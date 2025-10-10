import { SupabaseClient } from "@supabase/supabase-js";


export const checkCarAvailability = async(supabase: SupabaseClient, carid:string, startISO:Date, endISO:Date)=>{
    try{
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
        console.error(err)
        return false;
    }
}
