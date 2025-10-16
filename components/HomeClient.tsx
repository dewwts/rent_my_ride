// components/HomeClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { filterCars, UIRangeFilter, CardForUI } from "@/lib/filterCars";
import FilterSidebar from "@/components/FilterSidebar";

type Props = { initialCars: CardForUI[] };

export default function HomeClient({ initialCars }: Props) {
  const [filter, setFilter] = useState<UIRangeFilter>({
    includeUnavailable: false,
    gear_types: [],
  });

  const filtered = useMemo(
    () => filterCars(initialCars, filter),
    [initialCars, filter]
  );

  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
      <FilterSidebar value={filter} onChange={setFilter} />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            ผลการค้นหา {filtered.length} คัน
          </h2>
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
