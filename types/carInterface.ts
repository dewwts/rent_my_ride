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