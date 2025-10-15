// ---- Types (align with your CarCard) ----
export interface CarCard {
  brand: string;
  model: string;
  car_id: string; // license plate
  seats: number; // 1-50
  oil_type: string; // เบนซิน, ดีเซล, ไฟฟ้า, ...
  gear_type: string; // ออโต้, กระปุก, ...
  price_per_day: number; // 1-100,000 THB
  status: "available" | "unavailable";
  image_url?: string;
}

export interface CarRangeFilter {
  price?: { min?: number; max?: number }; // THB/day
  seats?: { min?: number; max?: number }; // seat count
  gear_types?: string[]; // allowed gear types; [] or undefined = any
  includeUnavailable?: boolean; // default false (only available)
}

// ---- Helper ----
const inRange = (value: number, min?: number, max?: number) => {
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
};

const norm = (s: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/**
 * Filter CarCards by price_per_day, seats, and gear_type (inclusive ranges).
 * Preserves original order; returns a new array.
 */
export function filterCarCardsByRange(
  cards: CarCard[],
  filter: CarRangeFilter
): CarCard[] {
  const { price, seats, gear_types, includeUnavailable = false } = filter ?? {};

  const hasGearFilter = Array.isArray(gear_types) && gear_types.length > 0;
  const normalizedGear = hasGearFilter ? gear_types!.map(norm) : [];

  return cards.filter((c) => {
    if (!includeUnavailable && c.status !== "available") return false;

    if (price && !inRange(c.price_per_day, price.min, price.max)) return false;
    if (seats && !inRange(c.seats, seats.min, seats.max)) return false;

    if (hasGearFilter) {
      const g = norm(c.gear_type);
      if (!normalizedGear.includes(g)) return false;
    }

    return true;
  });
}
