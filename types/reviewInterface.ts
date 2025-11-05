export interface Review{
    rating: number
    message: string
    reviewer_id: string
    target_id: string
    renting_id: string
}

export interface ReviewPayload extends Review{
    renting_id: string
}

export interface ReviewWithName {
  review_id: string;
  rating: number;
  comment: string;
  reviewer_id: string;
  reviewer_name: string;
  created_at: string;
}