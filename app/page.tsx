// app/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import HomeClient from "@/components/HomeClient";
import { fetchAllCars } from "@/lib/carServices";

export const revalidate = 0; // helpful while testing so results update immediately

export default async function Home() {
  // ดึงข้อมูลรถทั้งหมดจากฝั่งเซิร์ฟเวอร์ (ไม่มีพารามิเตอร์)
  const cars = await fetchAllCars();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <Hero />

          {/* รายการรถ (initialCars) */}
          <HomeClient initialCars={cars} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
