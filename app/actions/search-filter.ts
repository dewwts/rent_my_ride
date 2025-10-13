export interface CarCardProps {
  id: string;
  name: string;
  model: string;
  image: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  seats: number;
  fuelType: string;
  transmission: string;
  availability: string;
  features: string[];
}

/** Normalize text for robust matching: trim, lowercase, remove accents, collapse spaces */
function normalize(input: string): string {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** test test
 * Filter car options by the search text (matches against `name`). also works with partial match na ja.
 * @param text - User input from the search bar
 * @param options - List of CarCard objects to filter
 * @returns Filtered list (original order preserved)
 */
export function filterCarOptions(
  text: string,
  options: CarCardProps[]
): CarCardProps[] {
  const q = normalize(text);
  if (!q) return options; // empty search returns all

  const terms = q.split(" ");
  return options.filter((car) => {
    const name = normalize(car.name);
    // require every term to be included in the name
    return terms.every((t) => name.includes(t));
  });
}
