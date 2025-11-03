import { Review } from "@/types/reviewInterface"
import { SupabaseClient } from "@supabase/supabase-js"

/** 
 * Submit a review for a renting
 * How to use:
 * add parameter supabase client and payload of type Review
 * returns true if successful, otherwise throws an error
 
 * Review Schema is defined in types/reviewInterface.ts
 * you will see ReviewPayload has extends Review and has renting_id
 
 * for easier to maintainance and can use on get review for each car
 * Example of payload:
    paylaod = {
        rating: 5,
        message: "test",
        reviewer_id: "user-123",
        target_id: "user-456",
        renting_id: "renting-789"
    }
**/
export const submitReview = async(supabase: SupabaseClient, payload:Review)=>{
    const {error: insertError} = await supabase.from("reviews").insert(payload)
    if (insertError){
        console.error("Error submitting review:", insertError);
        throw new Error("มีปัญหาในการส่งรีวิว")
    }
    return true
}
export const deleteReview = async(supabase: SupabaseClient, reviewID:string)=>{
    const {error: deleteError} = await supabase.from("reviews").delete().eq("reviews_id",reviewID).single()
    if (deleteError){
        console.error("Error deleting review:", deleteError);
        throw new Error("มีปัญหาในการลบรีวิว")
    }
    return true
}