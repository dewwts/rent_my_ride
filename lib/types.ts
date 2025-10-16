// lib/types.ts
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
