"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCarById, updateCar, uploadImageCar } from "@/lib/carServices";
import { toast } from "@/components/ui/use-toast";
import { Car } from "@/types/carInterface";
import { EditCarForm } from "@/components/edit-car-form";

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (carId) {
      loadCar();
    }
  }, [carId]);

  const loadCar = async () => {
    setIsLoading(true);
    try {
      const carData = await getCarById(supabase, carId);
      if (!carData) {
        toast({
          variant: "destructive",
          title: "ไม่พบรถ",
          description: "ไม่พบรถที่ต้องการแก้ไข",
        });
        router.push("/dashboard/cars");
        return;
      }
      setCar(carData);

      // Mock data for development
      // const mockCar: Car = {
      //   id: carId,
      //   car_brand: "Honda",
      //   model: "Civic",
      //   car_id: "XXXXXXXX",
      //   year: 2018,
      //   number_of_seats: 4,
      //   car_type: "เก๋ง",
      //   color: "ขาว",
      //   mileage: 120000,
      //   oil_type: "เบนซิน",
      //   gear_type: "ออโต้",
      //   daily_rental_price: 1200,
      //   status: "available",
      //   location: "กรุงเทพฯ",
      //   rating: 4.5,
      //   car_image: "https://images.unsplash.com/photo-1704340142770-b52988e5b6eb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1400"
      // };
    } catch (error) {
      console.error("Error loading car:", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลรถได้",
      });
      router.push("/dashboard/cars");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCarUpdated = async (updatedCar: Car, image:File | null) => {
    setIsSaving(true);
    try {
      // Remove fields that shouldn't be updated directly
      const {car_id, created_at, updated_at, ...carData } = updatedCar;

      // Call your updateCar function, passing carId and carData (partial)
      await updateCar(supabase, carId, updatedCar);
      if (image){
        await uploadImageCar(supabase, image, updatedCar.car_id);
      }
      toast({
        variant: "success",
        title: "อัปเดตรถสำเร็จ",
        description: `รถ ${updatedCar.car_brand} ${updatedCar.model} ถูกอัปเดตเรียบร้อยแล้ว`,
      });

      router.push("/dashboard/cars");
    } catch (error) {
      console.error("Error updating car:", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตรถได้",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/cars");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลรถ...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">ไม่พบรถ</h2>
          <p className="text-gray-600 mb-6">ไม่พบรถที่ต้องการแก้ไข</p>
          <Button onClick={() => router.push("/dashboard/cars")}>
            กลับไปยังรายการรถ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EditCarForm
            car={car}
            onCarUpdated={handleCarUpdated}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </div>
      </main>
    </div>
  );
}
