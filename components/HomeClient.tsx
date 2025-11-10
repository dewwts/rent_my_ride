// components/HomeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { filterCars } from "@/lib/utils";
import { UIRangeFilter, CardForUI, DbCar } from "@/types/carInterface";
import FilterSidebar from "@/components/FilterSidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { fetchPopularityMap } from "@/lib/searchServices";
import { createClient } from "@/lib/supabase/client";
import { mapDbCarToCard } from "@/lib/utils";

type Props = { initialCars: CardForUI[] };
type SearchMeta = { location?: string; start?: string; end?: string };

type SortKey = "popularity" | "price_asc" | "rating_desc" | "year_desc";
const SORT_LABEL: Record<SortKey, string> = {
  popularity: "ความนิยม",
  price_asc: "ราคา (ต่ำไปสูง)",
  rating_desc: "คะแนนรีวิว",
  year_desc: "ปีที่ผลิต (รุ่นใหม่ก่อน)",
};

export default function HomeClient({ initialCars }: Props) {
  const [filter, setFilter] = useState<UIRangeFilter>({
    includeUnavailable: false,
    gear_types: [],
  });

  const [dynamicCars, setDynamicCars] = useState<CardForUI[] | null>(null);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("popularity");

  const [popularityMap, setPopularityMap] = useState<Record<string, number>>({});
  const supabase = useMemo(() => createClient(), []);


  
  // ฟังผลลัพธ์จาก Hero + ฟังสัญญาณรีเซ็ต
  useEffect(() => {
    type WithAvail = DbCar & { availability?: string };

    const handleResults = (e: Event) => {
      const { cars, meta } = (e as CustomEvent<{ cars: WithAvail[]; meta: SearchMeta }>).detail;

      const mapped: CardForUI[] = (cars ?? []).map((c) => {
        const base = mapDbCarToCard(c as DbCar);
        const availability =
          (c as WithAvail).availability ?? (base as any).availability ?? "ไม่พร้อมเช่า";
        return { ...base, availability };
      });

      setDynamicCars(mapped);
      setMeta(meta ?? null);
    };

    const handleReset = () => {
      setDynamicCars(null); // กลับไปใช้ initialCars
      setMeta(null);
    };

    window.addEventListener("cars:search-results", handleResults as EventListener);
    window.addEventListener("cars:reset", handleReset as EventListener);

    return () => {
      window.removeEventListener("cars:search-results", handleResults as EventListener);
      window.removeEventListener("cars:reset", handleReset as EventListener);
    };
  }, []);

  const sourceCars = dynamicCars ?? initialCars;

  // คำนวณความนิยมของรถชุดที่กำลังแสดง
  useEffect(() => {
    const run = async () => {
      const ids = sourceCars.map((c) => c.id);
      const map = await fetchPopularityMap(supabase, ids, {
        days: 180,
        countStatuses: ["Confirmed", "Completed"],
      });
      setPopularityMap(map);
    };
    run();
  }, [sourceCars, supabase]);

  // กรองก่อน
  const filtered = useMemo(() => filterCars(sourceCars, filter), [sourceCars, filter]);

  // แล้วค่อยเรียง
  const sorted = useMemo(() => {
    const arr = [...filtered];

    switch (sortBy) {
      case "price_asc":
        arr.sort((a, b) => (a.pricePerDay ?? 0) - (b.pricePerDay ?? 0));
        break;

      case "rating_desc":
        arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;

      case "year_desc": {
        const ya = (c: CardForUI) => (c as CardForUI)?.year ?? 0;
        arr.sort((a, b) => ya(b) - ya(a));
        break;
      }

      case "popularity":
      default: {
        const pop = (c: CardForUI) => popularityMap[c.id] ?? 0;
        arr.sort((a, b) => {
          const d1 = pop(b) - pop(a);
          if (d1 !== 0) return d1;
          const d2 = (b.rating ?? 0) - (a.rating ?? 0);
          if (d2 !== 0) return d2;
          return (a.pricePerDay ?? 0) - (b.pricePerDay ?? 0);
        });
        break;
      }
    }
    return arr;
  }, [filtered, sortBy, popularityMap]);

  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
      <FilterSidebar value={filter} onChange={setFilter} />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">ผลการค้นหา {sorted.length} คัน</h2>
            {meta && (
              <p className="text-sm text-gray-600 mt-1">
                {meta.location ? `สถานที่: ${meta.location} • ` : ""}
                {meta.start ? `รับ: ${meta.start}` : ""}
                {meta.end ? ` • คืน: ${meta.end}` : ""}
              </p>
            )}
          </div>

          {/* Dropdown: เรียงโดย */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="inline-flex items-center gap-2 rounded-full px-4">
                <ArrowUpDown className="h-4 w-4" />
                <span>เรียงโดย : {SORT_LABEL[sortBy]}</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setSortBy("popularity")}>
                <span className="flex-1">ความนิยม</span>
                {sortBy === "popularity" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price_asc")}>
                <span className="flex-1">ราคา (ต่ำไปสูง)</span>
                {sortBy === "price_asc" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rating_desc")}>
                <span className="flex-1">คะแนนรีวิว</span>
                {sortBy === "rating_desc" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("year_desc")}>
                <span className="flex-1">ปีที่ผลิต (รุ่นใหม่ก่อน)</span>
                {sortBy === "year_desc" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>
      </div>
    </section>
  );
}
               
