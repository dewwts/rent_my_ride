export interface Car {
  id: string;
  brand: string;
  model: string;
  car_id: string;
  year: number;
  seats: number;
  car_type: string;
  color: string;
  mileage: number;
  oil_type: string;
  gear_type: string;
  price_per_day: number;
  status: "available" | "unavailable";
  location: string;
  rating: number;
  image_url: string;
  created_at?: string;
  updated_at?: string;
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