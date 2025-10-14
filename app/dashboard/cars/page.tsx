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

// Mock data for development
const mockCars: Car[] = [
  {
    id: "1",
    brand: "Honda",
    model: "Civic",
    car_id: "XXXXXXXX",
    year: 2018,
    seats: 4,
    car_type: "เก๋ง",
    color: "ขาว",
    mileage: 120000,
    oil_type: "เบนซิน",
    gear_type: "ออโต้",
    price_per_day: 1200,
    status: "available",
    location: "กรุงเทพฯ",
    rating: 4.5,
    image_url: "https://images.unsplash.com/photo-1704340142770-b52988e5b6eb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1400"
  },
  {
    id: "2",
    brand: "Toyota",
    model: "Camry",
    car_id: "YYYYYYYY",
    year: 2019,
    seats: 5,
    car_type: "เก๋ง",
    color: "ดำ",
    mileage: 95000,
    oil_type: "เบนซิน",
    gear_type: "ออโต้",
    price_per_day: 1500,
    status: "available",
    location: "กรุงเทพฯ",
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
  },
  {
    id: "3",
    brand: "Mazda",
    model: "CX-5",
    car_id: "ZZZZZZZZ",
    year: 2020,
    seats: 5,
    car_type: "SUV",
    color: "แดง",
    mileage: 75000,
    oil_type: "เบนซิน",
    gear_type: "ออโต้",
    price_per_day: 1800,
    status: "unavailable",
    location: "กรุงเทพฯ",
    rating: 4.2,
    image_url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400"
  }
];

export default function MyCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>(mockCars);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; car: Car | null }>({
    isOpen: false,
    car: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  // Load cars on component mount
  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setIsLoading(true);
    try {
      // For now, use mock data. Later replace with:
      // const carsData = await getMyCars(supabase);
      // setCars(carsData);
      setCars(mockCars);
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

  const handleDeleteClick = (car: Car) => {
    setDeleteDialog({ isOpen: true, car });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.car) return;

    setIsDeleting(true);
    try {
      // For now, just remove from state. Later replace with:
      // await deleteCar(supabase, deleteDialog.car.id);
      setCars(prevCars => prevCars.filter(car => car.id !== deleteDialog.car!.id));
      
      toast({
        title: "ลบรถสำเร็จ",
        description: `รถ ${deleteDialog.car.brand} ${deleteDialog.car.model} ถูกลบเรียบร้อยแล้ว`,
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
    router.push(`/dashboard/cars/${car.id}/edit`);
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
                  key={car.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border-2 ${getStatusColor(car.status)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex gap-6">
                    {/* Car Image */}
                    <div className="w-64 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={car.image_url}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Car Details */}
                    <div className="flex-1 grid grid-cols-4 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {car.brand}
                        </h3>
                        <p className="text-gray-600">
                          {car.model} ID: {car.car_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          จำนวนที่นั่ง: {car.seats}
                        </p>
                        <p className="text-sm text-gray-500">
                          ประเภท: {car.car_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          ปี: {car.year}
                        </p>
                        <p className="text-sm text-gray-500">
                          สี: {car.color}
                        </p>
                        <p className="text-sm text-gray-500">
                          ไมล์: {car.mileage.toLocaleString()} km
                        </p>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">ราคา</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ฿{car.price_per_day.toLocaleString()}
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