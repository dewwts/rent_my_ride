export interface Car {
  id: string;
  brand: string;
  model: string;
  car_id: string;
  seats: number;
  oil_type: string;
  gear_type: string;
  price_per_day: number;
  status: "available" | "unavailable";
  image_url: string;
}