export interface Car {
  id: string;
  car_brand: string;
  model: string;
  car_id: string;
  year: number;
  number_of_seats: number;
  car_type: string;
  color: string;
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