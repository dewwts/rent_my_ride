import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";

// Mock car data
const mockCars = [
  {
    id: "1",
    name: "Honda",
    model: "City 2024",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
    pricePerDay: 1200,
    rating: 4.8,
    reviewCount: 156,
    seats: 5,
    fuelType: "เบนซิน",
    transmission: "ออโต้",
    availability: "พร้อมเช่า",
    features: ["เครื่องเสียง", "แอร์เย็น", "GPS", "กล้องหลัง"]
  },
  {
    id: "2", 
    name: "Toyota",
    model: "Yaris Ativ 2024",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&h=300&fit=crop",
    pricePerDay: 1100,
    rating: 4.7,
    reviewCount: 89,
    seats: 5,
    fuelType: "เบนซิน",
    transmission: "ออโต้",
    availability: "พร้อมเช่า",
    features: ["เครื่องเสียง", "แอร์เย็น", "USB", "เซฟตี้"]
  },
  {
    id: "3",
    name: "Mazda",
    model: "CX-5 2024", 
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop",
    pricePerDay: 2800,
    rating: 4.9,
    reviewCount: 203,
    seats: 7,
    fuelType: "เบนซิน",
    transmission: "ออโต้",
    availability: "จองล่วงหน้า",
    features: ["หนังแท้", "ซันรูฟ", "GPS", "กล้อง 360°", "เครื่องเสียงพรีเมียม"]
  },
  {
    id: "4",
    name: "Isuzu", 
    model: "MU-X 2024",
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&h=300&fit=crop",
    pricePerDay: 3500,
    rating: 4.6,
    reviewCount: 127,
    seats: 7,
    fuelType: "ดีเซล",
    transmission: "ออโต้",
    availability: "พร้อมเช่า", 
    features: ["4WD", "หนังแท้", "GPS", "กล้องรอบคัน", "เครื่องเสียง"]
  },
  {
    id: "5",
    name: "Honda",
    model: "Civic 2024",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop",
    pricePerDay: 1800,
    rating: 4.8,
    reviewCount: 241,
    seats: 5,
    fuelType: "เบนซิน",
    transmission: "ออโต้", 
    availability: "พร้อมเช่า",
    features: ["เครื่องเสียงพรีเมียม", "แอร์เย็น", "GPS", "กล้องหลัง", "USB-C"]
  },
  {
    id: "6",
    name: "Toyota",
    model: "Fortuner 2024",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop", 
    pricePerDay: 4200,
    rating: 4.7,
    reviewCount: 178,
    seats: 7,
    fuelType: "ดีเซล",
    transmission: "ออโต้",
    availability: "พร้อมเช่า",
    features: ["4WD", "หนังแท้", "ซันรูฟ", "GPS", "กล้อง 360°", "เครื่องเสียงพรีเมียม"]
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Hero />
          
          {/* Featured Cars Section */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">
                  รถยอดนิยม
                </h2>
                <p className="text-gray-600">
                  รถที่ลูกค้าเลือกเช่ามากที่สุด
                </p>
              </div>
              <Button variant="link">
                ดูทั้งหมด →
              </Button>
            </div>
            {/* dasdsadasdasda */}
            {/* Car Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCars.map((car) => (
                <CarCard key={car.id} {...car} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}