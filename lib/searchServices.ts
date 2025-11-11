// lib/searchServices.ts
import dayjs from "dayjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbCar } from "@/types/carInterface";
import { verify } from "crypto";


export async function searchCarsByLocation(
  supabase: SupabaseClient,
  location?: string
): Promise<DbCar[]> {
  let query = supabase
    .from("car_information")
    .select([
      "car_id",
      "car_brand",
      "model",
      "car_image",
      "daily_rental_price",
      "car_conditionrating",
      "number_of_seats",
      "oil_type",
      "gear_type",
      "status",
      "location",
      "year_created",
      "is_verified",  
    ].join(","));

  if (location?.trim()) {
    query = query.ilike("location", `%${location.trim()}%`);
  }

  const { data, error } = await query.returns<DbCar[]>();
  if (error) throw error;
  return data ?? [];
}

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
    // .in("status", ["Pending", "Confirmed"])
    .eq("status","Confirmed")
    .gte("edate", startDATE)          // edate >= start
    .lte("sdate", endExclusiveDATE)   // sdate <= end
    .returns<{ renting_id: string }[]>(); 
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
    .not("location", "is", null)
    .returns<{ location: string | null }[]>(); 

  if (error) return [];

  const all = (data ?? [])
    .map((r) => (r.location ?? "").trim())
    .filter(Boolean);

  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}

export function pickPopularLocations(all: string[], n = 6): string[] {
  return all.slice(0, n);
}

/** ค้นรถที่ว่างตาม location + ช่วงวัน (available -> verify overlap) */
export async function searchAvailableCars(
  supabase: SupabaseClient,
  params: { location?: string; startAt: Date; endAt: Date },
  opts?: { verifyPendingConfirmed?: boolean }
): Promise<DbCar[]> {
  const { location, startAt, endAt } = params;

  let query = supabase
    .from("car_information")
    .select(
      [
        "car_id",
        "car_brand",
        "model",
        "car_image",
        "daily_rental_price",
        "car_conditionrating",
        "number_of_seats",
        "oil_type",
        "gear_type",
        "is_verified",
        "location",
        "year_created", // ensure year is selected
      ].join(",")
    );

  if (location?.trim()) {
    query = query.ilike("location", `%${location.trim()}%`);
  }

  const { data, error } = await query.returns<DbCar[]>();
  if (error) throw error;

  const cars: DbCar[] = data ?? [];
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
    console.log(verifyFlags);
  }
  return availableCars;
}

/** ดึง popularity ของรถชุดที่กำลังแสดง: นับจำนวนการจองในช่วง X วัน และสถานะที่ถือว่าเกิดจริง */
export async function fetchPopularityMap(
  supabase: SupabaseClient,
  carIds: string[],
  opts?: {
    days?: number;                   // default 180
    countStatuses?: string[];       // default ["Confirmed"]
    weightRecentDays?: number;      // ถ้าอยากบูสต์ความสดใหม่ (เช่น 30)
    weightRecentBonus?: number;     // คะแนนโบนัสถ้าอยู่ในช่วง weightRecentDays (เช่น 0.5)
  }
): Promise<Record<string, number>> {
  if (carIds.length === 0) return {};

  const days = opts?.days ?? 180;
  const statuses = opts?.countStatuses ?? ["Confirmed"];
  const since = dayjs().subtract(days, "day").format("YYYY-MM-DD");

  type RentingRow = { car_id: string; sdate: string; status: string };

  const { data, error } = await supabase
    .from("renting")
    .select("car_id, sdate, status")
    .in("car_id", carIds)
    .gte("sdate", since)
    .in("status", statuses)
    .returns<RentingRow[]>(); 

  if (error) {
    console.error("fetchPopularityMap error:", error);
    return {};
  }

  const rows = data ?? [];
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.car_id] = (counts[row.car_id] ?? 0) + 1;
  }

  // (ทางเลือก) ถ่วงน้ำหนักความสดใหม่
  if (opts?.weightRecentDays && opts?.weightRecentBonus) {
    const cutoff = opts.weightRecentDays;
    const bonus = opts.weightRecentBonus;
    for (const row of rows) {
      if (dayjs().diff(dayjs(row.sdate), "day") <= cutoff) {
        counts[row.car_id] = (counts[row.car_id] ?? 0) + bonus;
      }
    }
  }

  return counts;
}
