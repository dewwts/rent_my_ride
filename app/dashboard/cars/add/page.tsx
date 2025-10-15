"use client";

import { useRouter } from "next/navigation";
import { AddCarForm } from "@/components/add-car-form";
import { Car } from "@/types/carInterface";
import { createCar } from "@/lib/carServices";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function AddCarPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const handleCarAdded = async (car: Omit<Car, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const newCar = await createCar(supabase, car);
    console.log(`เพิ่มรถสำเร็จ: รถ ${newCar.brand} ${newCar.model} ถูกเพิ่มเรียบร้อยแล้ว`);
  } catch (error) {
    console.error("เพิ่มรถไม่สำเร็จ:", error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มรถ");
  }
};

  const handleCancel = () => {
    // Redirect back to cars list
    router.push("/dashboard/cars");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AddCarForm onCarAdded={handleCarAdded} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
}
