// lib/carsRepo.ts
import "server-only";
import type { CardForUI, DbCar } from "@/types/carInterface";
import { createClient } from "@/lib/supabase/server";

function toAvailability(status: string | null | undefined) {
  return status === "available" || status === "พร้อมเช่า" ? "พร้อมเช่า" : "ไม่พร้อมเช่า";
}

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
        "year_created", 
      ].join(",")
    );

  if (error) throw error;

  const rows = (data ?? []) as unknown as DbCar[];

  return rows.map((r): CardForUI => {
    const price = Number(r.daily_rental_price ?? 0);
    const rating =
      typeof r.car_conditionrating === "number" && Number.isFinite(r.car_conditionrating)
        ? r.car_conditionrating
        : 0;
    const seats = Number(r.number_of_seats ?? 0);
    const year =
      typeof r.year_created === "number" && Number.isFinite(r.year_created)
        ? r.year_created
        : undefined;

    return {
      id: r.car_id,
      name: r.car_brand ?? "ไม่ระบุ",
      model: r.model ?? "",
      image: r.car_image ?? "",
      pricePerDay: price,
      rating,
      reviewCount: 0,
      seats,
      fuelType: r.oil_type ?? "",
      transmission: r.gear_type ?? "",
      availability: toAvailability(r.status),
      features: [],
      year, 
    };
  });
}
