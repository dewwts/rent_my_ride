// lib/carsRepo.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { CardForUI, CarRow } from "@/types/carInterface"; 

async function getSupabaseAnon() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        // old API expects `remove`, not `delete`
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}

function toAvailability(status: string | null | undefined) {
  return status === "available" || status === "พร้อมเช่า" ? "พร้อมเช่า" : "ไม่พร้อมเช่า";
}

export async function fetchAllCars(): Promise<CardForUI[]> {
  const supabase = await getSupabaseAnon(); // <-- use anon client
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

  if (error) throw error;

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