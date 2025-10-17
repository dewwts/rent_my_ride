// lib/searchServices.ts
import dayjs from "dayjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbCar } from "@/types/carInterface";

/** เช็คซ้ำแบบ DATE-only + กรองสถานะที่ถือว่าจองจริง */
export async function hasDateOverlapPendingOrConfirmed(
  supabase: SupabaseClient,
  carId: string,
  startAt: Date,
  endAt: Date
): Promise<boolean> {
  const startDATE = dayjs(startAt).format("YYYY-MM-DD");      // inclusive
  const endExclusiveDATE = dayjs(endAt).format("YYYY-MM-DD"); // exclusive

  const { data, error } = await supabase
    .from("renting")
    .select("renting_id")
    .eq("car_id", carId)
    .in("status", ["Pending", "Confirmed"])
    .gt("edate", startDATE)          // edate > start
    .lt("sdate", endExclusiveDATE);  // sdate < end

  if (error) return true; // เช็คไม่ได้ให้ถือว่าทับ ป้องกันพลาด
  return (data?.length ?? 0) > 0;
}

/** ดึงรายการสถานที่สำหรับ autocomplete */
export async function fetchLocationOptions(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from("car_information")
    .select("location")
    .not("location", "is", null);

  if (error) return [];
  const all = (data ?? [])
    .map((r: any) => (r.location ?? "").trim())
    .filter(Boolean);

  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}

export function pickPopularLocations(all: string[], n = 6): string[] {
  return all.slice(0, n);
}

/** ค้นรถที่ว่างตาม location + ช่วงวัน (ประกอบด้วย 2 ชั้น: available -> verify overlap) */
export async function searchAvailableCars(
  supabase: SupabaseClient,
  params: { location?: string; startAt: Date; endAt: Date },
  opts?: { verifyPendingConfirmed?: boolean }
): Promise<DbCar[]> {
  const { location, startAt, endAt } = params;


  let query = supabase
  .from("car_information")
  .select(
    "car_id, car_brand, model, car_image, daily_rental_price, car_conditionrating, number_of_seats, oil_type, gear_type, status, location, year_created" // 👈 add this
  );


  if (location?.trim()) {
    query = query.ilike("location", `%${location.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  const cars = (data ?? []) as DbCar[];
  const { carAvailable } = await import("@/lib/carServices");
  const flags = await Promise.all(
    cars.map((c) => carAvailable(supabase, c.car_id, startAt, endAt))
  );
  let availableCars = cars.filter((_, i) => flags[i] === true);
  if (opts?.verifyPendingConfirmed !== false) {
    const verifyFlags = await Promise.all(
      availableCars.map((c) =>
        hasDateOverlapPendingOrConfirmed(supabase, c.car_id, startAt, endAt)
      )
    );
    availableCars = availableCars.filter((_, i) => verifyFlags[i] === false);
  }

  return availableCars;
}
