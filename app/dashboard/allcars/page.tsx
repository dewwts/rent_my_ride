import { fetchAllCars } from "@/lib/serverServices";
import AllCarsClient from "@/components/allcarsclient";
import type { CardForUI } from "@/types/carInterface";

export const revalidate = 0;

export default async function AllCarsPage() {
  const cars: CardForUI[] = await fetchAllCars();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AllCarsClient initialCars={cars} />
        </div>
      </main>
    </div>
  );
}