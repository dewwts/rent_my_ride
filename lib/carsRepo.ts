
import { createClient } from "@supabase/supabase-js";
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { CardForUI, CarRow } from "./types"; // or inline the types like before


function getSupabaseAdmin() {
  // ใช้ service role บนเซิร์ฟเวอร์เท่านั้น
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // <— service role
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
function toAvailability(status: string | null | undefined) {
  if (status === "available" || status === "พร้อมเช่า") return "พร้อมเช่า";
  return "จองล่วงหน้า";
}
export async function fetchAllCars(): Promise<CardForUI[]> {
  const supabase = getSupabaseAdmin(); // <— เปลี่ยนมาใช้ admin
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
      ].join(",")
    );

  if (error) {
    // โยน error ให้ page ตัดสินใจจัดการ หรือจะ return [] ก็ได้
    throw error;
  }

  const rows = (data ?? []) as unknown as CarRow[];

  return rows.map((r) => ({
    id: r.car_id,
    name: r.car_brand ?? "ไม่ระบุ",
    model: r.model ?? "",
    image: r.car_image ?? "",
    pricePerDay: r.daily_rental_price ?? 0,
    rating: 0,
    reviewCount: 0,
    seats: r.number_of_seats ?? 0,
    fuelType: r.oil_type ?? "",
    transmission: r.gear_type ?? "",
    availability: toAvailability(r.status),
    features: [],
  }));
}
