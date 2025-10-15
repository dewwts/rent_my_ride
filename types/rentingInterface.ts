export enum RentingStatus {
  CONFIRMED = "Confirmed",
  PENDING = "Pending"
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