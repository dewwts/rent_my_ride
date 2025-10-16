// app/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import HomeClient from "@/components/HomeClient";
import { fetchAllCars } from "@/lib/carsRepo";

export default async function Home() {
  // ดึงข้อมูลจริงจาก Supabase ฝั่งเซิร์ฟเวอร์
  const cars = await fetchAllCars();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Hero />
          <HomeClient initialCars={cars} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
