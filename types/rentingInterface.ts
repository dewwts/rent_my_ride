export enum RentingStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending"
}

export interface rentingInfo {
    renting_id : string,
    lessee_id : string,
    car_id : string,
    sdate : string,
    edate : string,
    status : RentingStatus,
    created_at : string
}