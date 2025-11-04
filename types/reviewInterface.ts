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