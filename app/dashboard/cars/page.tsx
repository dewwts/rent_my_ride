"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Car {
  id: string;
  brand: string;
  model: string;
  car_id: string;
  seats: number;
  oil_type: string;
  gear_type: string;
  price_per_day: number;
  status: "available" | "unavailable";
  image_url: string;
}

// Mock data
const mockCars: Car[] = [
  {
    id: "1",
    brand: "Honda",
    model: "Civic",
    car_id: "XXXXXXXX",
    seats: 5,
    oil_type: "ไฟฟ้า",
    gear_type: "ออโต้",
    price_per_day: 1200,
    status: "unavailable",
    image_url: "https://images.unsplash.com/photo-1704340142770-b52988e5b6eb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1400"
  },
  {
    id: "2",
    brand: "Rambogini",
    model: "Civic",
    car_id: "XXXXXXXX",
    seats: 5,
    gear_type: "กระปุก",
    oil_type: "เบนซิน",
    price_per_day: 1200,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
  },
  {
    id: "3",
    brand: "Honda",
    model: "Civic",
    car_id: "XXXXXXXX",
    seats: 5,
    gear_type: "ออโต้",
    oil_type: "เบนซิน",
    price_per_day: 1200,
    status: "available",
    image_url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400"
  }
];

export default function MyCarsPage() {
  const router = useRouter();
  const [cars] = useState<Car[]>(mockCars);

  const handleDelete = (carId: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรถคันนี้?")) {
      alert("ลบรถสำเร็จ");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-black mb-2">รถของฉัน</h1>
            </div>
            <Button className="text-white rounded-md px-4 py-2">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มรถใหม่
            </Button>
          </div>

          <div className="space-y-4">
            {cars.map((car) => (
              <div
                key={car.id}
                className={`bg-white rounded-lg p-4 flex gap-4 items-center ${
                  car.status === "available"
                    ? "border-2 border-green-400"
                    : "border-2 border-red-400"
                }`}
              >
                
                <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={car.image_url}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                
                <div className="flex-1 grid grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1">
                      {car.brand}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {car.model} ・ {car.car_id}
                    </p>
                    <p className="text-xs">
                      จำนวนที่นั่ง : {car.seats}
                    </p>
                    <p className="text-xs">
                      น้ำมัน : {car.oil_type}
                    </p>
                    <p className="text-xs">
                      ระบบเกียร์ : {car.gear_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-semibold mb-1">ราคา</p>
                    <p className="text-sm font-medium text-black">
                      {car.price_per_day} / วัน
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-semibold mb-1">สถานะ</p>
                    <p className="text-sm font-medium text-black">
                      {car.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                    </p>
                  </div>

                  <div>
                    <p className="text-lg font-semibold mb-1">คะแนน</p>
                    <p className="text-sm font-medium text-black">4.5/5</p>
                  </div>
                </div>

                {car.status === "available" ? (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="text-white px-6"
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-6"
                      onClick={() => handleDelete(car.id)}
                    >
                      ลบ
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 flex-shrink-0 invisible">
                    <Button
                      size="sm"
                      className="px-6"
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      className="px-6"
                    >
                      ลบ
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}