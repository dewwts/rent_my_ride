// lib/filterCars.ts
import { UIRangeFilter } from "@/types/carInterface";
import { CardForUI } from "@/types/carInterface";


const inRange = (v: number, min?: number, max?: number) =>
  (min == null || v >= min) && (max == null || v <= max);

const norm = (s: string) =>
  (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export function filterCars(cards: CardForUI[], f: UIRangeFilter): CardForUI[] {
  const { price, seats, gear_types, includeUnavailable = false } = f ?? {};
  const hasGear = !!(gear_types && gear_types.length);
  const gears = hasGear ? gear_types!.map(norm) : [];

  return cards.filter((c) => {
    if (!includeUnavailable && c.availability !== "พร้อมเช่า") return false;
    if (price && !inRange(c.pricePerDay, price.min, price.max)) return false;
    if (seats && !inRange(c.seats, seats.min, seats.max)) return false;
    if (hasGear && !gears.includes(norm(c.transmission))) return false;
    return true;
  });
}
