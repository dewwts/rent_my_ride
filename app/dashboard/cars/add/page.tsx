"use client";

import { useRouter } from "next/navigation";
import { AddCarForm } from "@/components/add-car-form";
import { Car } from "@/types/carInterface";
import { useToast } from "@/components/ui/use-toast"; // Corrected import

export default function AddCarPage() {
  const router = useRouter();
  const { toast } = useToast(); // Destructure from useToast hook

  const handleCarAdded = (car: Car) => {
    // Redirect back to cars list after successful addition
    toast({
      variant: "success",
      title: "เพิ่มรถสำเร็จ",
      description: `รถ ${car.car_brand} ${car.model} ถูกเพิ่มเรียบร้อยแล้ว`,
    });
    router.push("/dashboard/cars");
  };

  const handleCancel = () => {
    // Redirect back to cars list
    toast({
      variant: "destructive",
      title: "เพิ่มรถไม่สำเร็จ",
      description: "เกิดข้อผิดพลาดในการเพิ่มรถ",
    });
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