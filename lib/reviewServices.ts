import { Review } from "@/types/reviewInterface"
import { SupabaseClient } from "@supabase/supabase-js"

export const submitReview = async(supabase: SupabaseClient, payload:Review)=>{
    const {error: insertError} = await supabase.from("reviews").insert(payload)
    if (insertError){
        console.error("Error submitting review:", insertError);
        throw insertError
    }
    return true
}