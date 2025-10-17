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
export interface UIRangeFilter {
  price?: { min?: number; max?: number };
  seats?: { min?: number; max?: number };
  gear_types?: string[];        // "ออโต้", "ธรรมดา", ...
  includeUnavailable?: boolean; // default false
}
export type CarRow = {
  car_id: string;
  daily_rental_price: number | null;
  car_image: string | null;
  car_brand: string | null;
  model: string | null;
  number_of_seats: number | null;
  oil_type: string | null;
  gear_type: string | null;
  status: string | null;
};
export type CardForUI = {
  id: string;
  name: string;
  model: string;
  image: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  seats: number;
  fuelType: string;
  transmission: string;
  availability: string; // "พร้อมเช่า" | "จองล่วงหน้า"
  features: string[];
};
export interface CarCardProps {
  id: string;
  name: string;
  model: string;
  image?: string;               // make optional for fallback
  pricePerDay: number;
  rating?: number;              // optional; default 0
  reviewCount?: number;         // optional; default 0
  seats: number;
  fuelType: string;
  transmission: string;
  availability: string;         // "พร้อมเช่า" | "จองล่วงหน้า" | ...
  features?: string[];          // optional
}
// export interface CarInput {
//   car_brand: string;
//   model: string;
//   car_id: string;
//   year: number;
//   number_of_seats: number;
//   car_type: string;
//   color: string;
//   mileage: number;
//   oil_type: string;
//   gear_type: string;
//   status: "available" | "unavailable";
//   location: string;
//   rating: number;
//   car_image: string;
//   created_at?: string;
//   updated_at?: string;
//   daily_rental_price?: number;
// }