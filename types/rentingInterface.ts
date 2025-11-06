
export enum RentingStatus {
  CONFIRMED = "Confirmed",
  PENDING = "Pending"
}
export interface rentingBase {
  renting_id:string,
  car_id:string,
  sdate:string,
  edate:string,
  status:RentingStatus,
  total_price:number,
}
export interface bookingHistory extends rentingBase {
  car_information:{
    car_id:string,
    owner:{
      u_firstname:string
    },
  },
}
export interface rentingHistory extends rentingBase {
  lessee_name: string;
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
export interface RentingDetail {
  renting_id: string;
  car_id: string;
  sdate: string; // เก็บแบบ YYYY-MM-DD
  edate: string; // เก็บแบบ YYYY-MM-DD
  status: string;
  car_information?: {
    car_brand: string;
    model: string;
    daily_rental_price: number;
    car_image?: string;
    location?: string;
  };
}

export interface BookingWithReview extends bookingHistory {
  hasReviewed?: boolean;
}