"use client";

import { useState } from "react";
import type { CardForUI } from "@/types/carInterface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";

interface AllCarsClientProps {
  initialCars: CardForUI[];
}

export default function AllCarsClient({ initialCars }: AllCarsClientProps) {
  const [cars, setCars] = useState<CardForUI[]>(initialCars);

  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 3;
  const pageCount = Math.ceil(cars.length / carsPerPage);
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (carId: string, newStatus: boolean) => {
    const originalCars = [...cars];

    setCars((prevCars) =>
      prevCars.map((car) =>
        car.id === carId ? { ...car, is_verified: newStatus } : car
      )
    );

    setIsUpdatingId(carId);
    setOpenDropdownId(null);

    try {
      await axios.patch(`/api/car/${carId}`, {
        is_verified: newStatus,
      });

      console.log("Status updated successfully for car:", carId);
    } catch (error) {
      console.error("Failed to update status:", error);

      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "API Error:",
          error.response.data.error || error.response.data.message
        );
      }

      setCars(originalCars);
    } finally {
      setIsUpdatingId(null);
    }
  };

  if (cars.length === 0) {
    return (
      <p className="text-gray-600 text-center py-10">ไม่มีข้อมูลรถในระบบ</p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">รถทั้งหมด</h1>

      <div className="flex flex-col space-y-6">
        {currentCars.map((car) => {
          if (!car.id) return null;

          const isVerified = car.is_verified === true;
          const isDropdownOpen = openDropdownId === car.id;
          const isUpdating = isUpdatingId === car.id;

          return (
            <div
              key={car.id}
              className={cn(
                "flex flex-row bg-white border rounded-xl p-4 shadow-sm transition-all hover:shadow-md space-x-6",
                isVerified ? "border-green-400" : "border-red-400"
              )}
            >
              <div className="w-64 flex-shrink-0 relative h-40">
                <Image
                  src={car.image || "/placeholder-car.jpg"}
                  alt={car.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-black">{car.name}</h3>
                <p className="text-sm text-gray-500">
                  CarID : {car.id?.slice(0, 8) || "XXXXXXXX"}
                </p>
                <div className="mt-3 text-gray-700 space-y-1">
                  <p>จำนวนที่นั่ง : {car.seats}</p>
                  <p>น้ำมัน : {car.fuelType}</p>
                  <p>ระบบเกียร์ : {car.transmission}</p>
                </div>
              </div>

              <div className="text-center w-28 flex-1 pt-1 flex flex-col">
                <p className="font-semibold text-black">ราคา</p>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-700">{car.pricePerDay} / วัน</p>
                </div>
              </div>

              <div className="text-center w-32 flex-1 pt-1 flex flex-col">
                <p className="font-semibold text-black mb-1">สถานะ</p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    <span
                      onClick={() =>
                        !isUpdating &&
                        setOpenDropdownId(isDropdownOpen ? null : car.id)
                      }
                      className={cn(
                        "px-3 py-1 rounded-md text-sm font-medium border flex items-center justify-center gap-1",
                        "cursor-pointer select-none transition-all",
                        isUpdating
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                          : "cursor-pointer",
                        isVerified
                          ? "border-green-400 text-green-700 bg-green-50"
                          : "border-orange-400 text-orange-700 bg-orange-50"
                      )}
                      aria-disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <svg
                          className="animate-spin h-4 w-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <>
                          {isVerified ? "Verified" : "Unverified"}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.855a.75.75 0 111.08 1.04l-4.24 4.405a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </span>

                    {isDropdownOpen && (
                      <div
                        className={cn(
                          "absolute top-full mt-1.5 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10 overflow-hidden",
                          "left-1/2 -translate-x-1/2"
                        )}
                      >
                        <button
                          onClick={() => handleStatusChange(car.id, true)}
                          className={cn(
                            "block w-full text-left px-3 py-2 text-sm",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            isVerified
                              ? "font-medium text-green-700"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                          disabled={isVerified || !!isUpdatingId}
                        >
                          Verified
                        </button>
                        <button
                          onClick={() => handleStatusChange(car.id, false)}
                          className={cn(
                            "block w-full text-left px-3 py-2 text-sm",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            !isVerified
                              ? "font-medium text-orange-700"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                          disabled={!isVerified || !!isUpdatingId}
                        >
                          Unverified
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center w-24 flex-1 pt-1 flex flex-col">
                <p className="font-semibold text-black">คะแนน</p>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-700">
                    {car.rating + "/5" || "4.5/5"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center space-x-2 mt-8">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "black" : "ghost"}
            size="sm"
            onClick={() => handlePageClick(page)}
          >
            {page}
          </Button>
        ))}
      </div>
    </div>
  );
}