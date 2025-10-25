"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DeleteCarDialog } from "@/components/delete-car-dialog";
import { createClient } from "@/lib/supabase/client";
import { getMyCars, deleteCar } from "@/lib/carServices";
import { toast } from "@/components/ui/use-toast";
import { Car } from "@/types/carInterface";
import Image from "next/image";

export default function MyCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; car: Car | null }>({
    isOpen: false,
    car: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  // Load cars on component mount
  useEffect(() => {
    const loadCars = async () => {
      setIsLoading(true);
      try {
        const myCar = await getMyCars(supabase);
        setCars(myCar);
      } catch (error) {
        console.error("Error loading cars:", error);
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลรถได้",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadCars();
  }, [supabase]);
  

  const handleDeleteClick = (car: Car) => {
    setDeleteDialog({ isOpen: true, car });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.car) return;

    setIsDeleting(true);
    try {
      await deleteCar(supabase, deleteDialog.car.car_id)
      setCars(prevCars => prevCars.filter(car => car.car_id !== deleteDialog.car!.car_id));
      
      toast({
        variant: "success",
        title: "ลบรถสำเร็จ",
        description: `รถ ${deleteDialog.car.car_brand} ${deleteDialog.car.model} ถูกลบเรียบร้อยแล้ว`,
      });
      
      setDeleteDialog({ isOpen: false, car: null });
    } catch (error) {
      console.error("Error deleting car:", error);
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรถได้",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (car: Car) => {
    router.push(`/dashboard/cars/${car.car_id}/edit`);
  };


  const getStatusColor = (status: string) => {
    return status === "available" ? "border-green-400" : "border-red-400";
  };

  const getStatusText = (status: string) => {
    return status === "available" ? "ว่าง" : "ไม่ว่าง";
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">รถของฉัน</h1>
              <p className="text-gray-600">จัดการรถที่คุณลงประกาศให้เช่า</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 flex items-center gap-2"
              onClick={() => router.push("/dashboard/cars/add")}
            >
              <Plus className="w-5 h-5" />
              เพิ่มรถใหม่
            </Button>
          </div>

          {/* Cars List */}
          <div className="space-y-6">
            {cars.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรถ</h3>
                <p className="text-gray-600 mb-6">เริ่มต้นด้วยการเพิ่มรถคันแรกของคุณ</p>
                <Button 
                  onClick={() => router.push("/dashboard/cars/add")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  เพิ่มรถใหม่
                </Button>
              </div>
            ) : (
              cars.map((car) => (
                <div
                  key={car.car_id}
                  className={`bg-white rounded-xl p-6 shadow-sm border-2 ${getStatusColor(car.status)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex gap-6">
                    {/* Car Image */}
                    <div className="relative w-64 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={car.car_image}
                        fill={true}
                        alt={`${car.car_brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Car Details */}
                    <div className="flex-1 grid grid-cols-4 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {car.car_brand}
                        </h3>
                        <p className="text-gray-600">
                          {car.model} ID: {car.car_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          จำนวนที่นั่ง: {car.number_of_seats}
                        </p>
                        <p className="text-sm text-gray-500">
                          ประเภท: {car.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          ปี: {car.year_created}
                        </p>
                        {/* <p className="text-sm text-gray-500">
                          สี: {car.color}
                        </p> */}
                        <p className="text-sm text-gray-500">
                          ไมล์: {car.mileage.toLocaleString()} km
                        </p>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">ราคา</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ฿{car.daily_rental_price ? car.daily_rental_price.toLocaleString(): 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">/ วัน</p>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">สถานะ</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          car.status === "available" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {getStatusText(car.status)}
                        </span>
                        <p className="text-sm text-gray-500">
                          ที่จอด: {car.location}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">คะแนน</p>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-yellow-500">
                            {car.rating}
                          </span>
                          <span className="text-gray-500">/5</span>
                        </div>
                        <p className="text-sm text-gray-500">(200 รีวิว)</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 px-4 py-2"
                        onClick={() => handleEditClick(car)}
                      >
                        <Edit className="w-4 h-4" />
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-2 px-4 py-2"
                        onClick={() => handleDeleteClick(car)}
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <DeleteCarDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, car: null })}
        onConfirm={handleDeleteConfirm}
        car={deleteDialog.car}
        isLoading={isDeleting}
      />
    </div>
  );
}