// lib/carsRepo.ts
import "server-only";
import type { CardForUI, CarRow } from "@/types/carInterface";
import { createClient } from "@/lib/supabase/server"; 

function toAvailability(status: string | null | undefined) {
  return status === "available" || status === "พร้อมเช่า" ? "พร้อมเช่า" : "ไม่พร้อมเช่า";
}

type RowWithCondition = CarRow & {
  car_conditionrating: number | null;
};

export async function fetchAllCars(): Promise<CardForUI[]> {
  const supabase = await createClient(); // ใช้จาก server.ts

  const { data, error } = await supabase
    .from("car_information")
    .select(
      [
        "car_id",
        "daily_rental_price",
        "car_image",
        "car_brand",
        "model",
        "number_of_seats",
        "oil_type",
        "gear_type",
        "status",
        "car_conditionrating",
      ].join(",")
    );

  if (error) throw error;

  const rows = (data ?? []) as unknown as RowWithCondition[];

  return rows.map((r) => {
    const conditionRating =
      typeof r.car_conditionrating === "number" && Number.isFinite(r.car_conditionrating)
        ? r.car_conditionrating
        : 0;

    return {
      id: r.car_id,
      name: r.car_brand ?? "ไม่ระบุ",
      model: r.model ?? "",
      image: r.car_image ?? "",
      pricePerDay: Number(r.daily_rental_price ?? 0),
      rating: conditionRating,       // แสดงค่าจาก car_conditionrating
      reviewCount: 0,                // ยังไม่ดึงรีวิวจากตาราง reviews
      seats: r.number_of_seats ?? 0,
      fuelType: r.oil_type ?? "",
      transmission: r.gear_type ?? "",
      availability: toAvailability(r.status),
      features: [],
    };
  });
}
