// lib/carsRepo.ts
import "server-only";
import type { CardForUI, CarRow } from "@/types/carInterface";
import { createClient } from "@/lib/supabase/server";

function toAvailability(status: string | null | undefined) {
  return status === "available" || status === "พร้อมเช่า" ? "พร้อมเช่า" : "ไม่พร้อมเช่า";
}

type RowWithCondition = CarRow & {
  car_conditionrating: number | null;
  year_created: number | null; // ✅ เพิ่มให้ชัดเจน
};

export async function fetchAllCars(): Promise<CardForUI[]> {
  const supabase = await createClient();

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
        "year_created", // ✅ ดึงปีผลิตจาก DB
      ].join(",")
    );

  if (error) throw error;

  const rows = (data ?? []) as unknown as RowWithCondition[];

  return rows.map((r) => {
    const conditionRating =
      typeof r.car_conditionrating === "number" && Number.isFinite(r.car_conditionrating)
        ? r.car_conditionrating
        : 0;

    const year =
      typeof r.year_created === "number" && Number.isFinite(r.year_created)
        ? r.year_created
        : undefined; // ให้ undefined ถ้าไม่มี/ไม่ถูกต้อง (sort ฝั่ง UI รองรับอยู่แล้ว)

    return {
      id: r.car_id,
      name: r.car_brand ?? "ไม่ระบุ",
      model: r.model ?? "",
      image: r.car_image ?? "",
      pricePerDay: Number(r.daily_rental_price ?? 0),
      rating: conditionRating,
      reviewCount: 0,
      seats: r.number_of_seats ?? 0,
      fuelType: r.oil_type ?? "",
      transmission: r.gear_type ?? "",
      availability: toAvailability(r.status),
      features: [],
      year, //เติม year ให้ CardForUI
    } as CardForUI;
  });
}
