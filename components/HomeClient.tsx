// components/HomeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import {filterCars} from "@/lib/filterCars";
import { UIRangeFilter,CardForUI } from "@/types/carInterface";
import FilterSidebar from "@/components/FilterSidebar";
import { DbCar } from "@/types/carInterface";
type Props = { initialCars: CardForUI[] };

// shape ของ row ที่ Hero ส่งมา (ตรงกับ select ใน hero.tsx)


type SearchMeta = { location?: string; start?: string; end?: string };

function toAvailability(status: string | null | undefined) {
  return status === "available" || status === "พร้อมเช่า" ? "พร้อมเช่า" : "ไม่พร้อมเช่า";
}

function mapDbCarToCard(c: DbCar): CardForUI {
  return {
    id: c.car_id,
    name: c.car_brand ?? "ไม่ระบุ",
    model: c.model ?? "",
    image: c.car_image ?? "",
    pricePerDay: Number(c.daily_rental_price ?? 0),
    rating: Number(c.car_conditionrating ?? 0),
    reviewCount: 0,
    seats: c.number_of_seats ?? 0,
    fuelType: c.oil_type ?? "",
    transmission: c.gear_type ?? "",
    availability: toAvailability(c.status),
    features: [],
  };
}

export default function HomeClient({ initialCars }: Props) {
  const [filter, setFilter] = useState<UIRangeFilter>({
    includeUnavailable: false,
    gear_types: [],
  });

  // ✅ เก็บผลค้นหาจาก Hero (ถ้ายังไม่ค้นหา ให้เป็น null → ใช้ initialCars)
  const [dynamicCars, setDynamicCars] = useState<CardForUI[] | null>(null);
  const [meta, setMeta] = useState<SearchMeta | null>(null);

  // ✅ ฟังผลลัพธ์จาก Hero
  useEffect(() => {
    const handler = (e: Event) => {
      const { cars, meta } = (e as CustomEvent<{ cars: DbCar[]; meta: SearchMeta }>).detail;

      console.log("[HomeClient] received cars: ", cars?.length ?? 0, meta);
      console.table((cars ?? []).map((c) => ({ car_id: c.car_id, location: c.location })));

      const mapped = (cars ?? []).map(mapDbCarToCard);
      console.log("[HomeClient] mapped to CardForUI:", mapped.length);

      setDynamicCars(mapped);
      setMeta(meta ?? null);
    };

    window.addEventListener("cars:search-results", handler as EventListener);
    return () => window.removeEventListener("cars:search-results", handler as EventListener);
  }, []);

  // ใช้ dynamicCars ถ้ามี ไม่งั้น fallback เป็น initialCars
  const sourceCars = dynamicCars ?? initialCars;

  // ใช้ฟิลเตอร์เดิมของคุณ
  const filtered = useMemo(() => {
    const out = filterCars(sourceCars, filter);
    console.log(
      "[HomeClient] filtering:",
      { source: sourceCars.length, afterFilter: out.length, filter }
    );
    return out;
  }, [sourceCars, filter]);

  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
      <FilterSidebar value={filter} onChange={setFilter} />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">ผลการค้นหา {filtered.length} คัน</h2>
            {meta && (
              <p className="text-sm text-gray-600 mt-1">
                {meta.location ? `สถานที่: ${meta.location} • ` : ""}
                {meta.start ? `รับ: ${meta.start}` : ""}
                {meta.end ? ` • คืน: ${meta.end}` : ""}
              </p>
            )}
          </div>
          <Button variant="outline">เรียงโดย: ความนิยม</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>
      </div>
    </section>
  );
}
