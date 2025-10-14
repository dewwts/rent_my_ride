import { SupabaseClient } from "@supabase/supabase-js";


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
