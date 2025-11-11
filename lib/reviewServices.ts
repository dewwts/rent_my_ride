import { Review } from "@/types/reviewInterface"
import { SupabaseClient } from "@supabase/supabase-js"
import { calculateAverageRating } from "./utils"
// any
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
        target_id: "car_id-123",
        renting_id: "renting-789"
    }
**/
export const submitReview = async(supabase: SupabaseClient, payload:Review)=>{
    const {error} = await supabase.rpc("submit_review_and_update_rating",{
      p_user_id: payload.reviewer_id,
      p_target_id: payload.target_id,
      p_rating: payload.rating,
      p_comment: payload.comment,
      p_renting_id: payload.renting_id
    })
    if (error){
      console.error("Error submitting review:", error);
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

export const getCarReview = async(supabase:SupabaseClient, car_id:string)=>{
  const{data,error:err} = await supabase.from("reviews").select("review_id, rating,comment,created_at,reviewer_id").eq("target_id",car_id).order("created_at", { ascending: false })
  if(err){
    throw new Error("Error")
  }
  return data;
}

export async function checkReviewExists(
  supabase: SupabaseClient,
  rentingId: string
): Promise<boolean> {
  console.log(rentingId);
  const { data, error } = await supabase
    .from('reviews')
    .select('review_id')
    .eq('renting_id', rentingId)
    .single();
  if (error && error.code === 'PGRST116') { // PGRST116 is "no rows returned"
    // console.error('Error checking review:', error);
    return false;
  }else if (error){
    console.log(error.code);
    console.error('Error checking review:', error);
    return false
  }
  return !!data;
}

/**
 * Fetch car rating and review count
 * Returns an object with average rating and total review count
 * Example return: { rating: 4.5, reviewCount: 10 }
 */
export const getCarRating = async(
  supabase: SupabaseClient, 
  car_id: string
): Promise<{ rating: number; reviewCount: number }> => {
  try {
    const reviews = await getCarReview(supabase, car_id);

    if (reviews && reviews.length > 0) {
      return {
        rating: calculateAverageRating(reviews),
        reviewCount: reviews.length
      };
    } else {
      // No reviews yet
      return {
        rating: 0,
        reviewCount: 0
      };
    }
  } catch (error) {
    console.error('Error fetching car rating:', error);
    throw new Error("มีปัญหาในการดึงข้อมูลรีวิว");
  }
}

export const getCountReview = async(supabase: SupabaseClient, car_id:string)=>{
  const {count, error} = await supabase.from("reviews").select("*",{count:"exact"}).eq("target_id",car_id)
  if (error){
    throw new Error("เกิดปัญหาในการหาจำนวนการรีวิว")
  }
  return count
}