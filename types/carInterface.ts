export interface Car {
  // id: string;
  car_brand: string;
  model: string;
  car_id: string;
  year: number;
  number_of_seats: number;
  car_type: string;
  // color: string;
  mileage: number;
  oil_type: string;
  gear_type: string;
  status: "available" | "unavailable";
  location: string;
  rating: number;
  car_image: string;
  created_at?: string;
  updated_at?: string;
  daily_rental_price?: number;
}
export interface CarCheckout {
  rid: string;
  r_date: string;
  total_days: number;
  p_date: string;
  e_date: string;
  localtion_take: string;
  location_return:string;
  total_price: number;
  car_id: string;
  description: string;
  car_brand: string;
  car_model: string;
  car_image: string;
  amount: number;
}