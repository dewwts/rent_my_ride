"use client";

import { useState } from "react";
import type { CardForUI } from "@/types/carInterface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AllCarsClientProps {
  initialCars: CardForUI[];
}

export default function AllCarsClient({ initialCars }: AllCarsClientProps) {
  const [cars, setCars] = useState<CardForUI[]>(initialCars);
  // const router = useRouter();

  // --- PAGINATION LOGIC ---
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 3;
  const pageCount = Math.ceil(cars.length / carsPerPage);
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  // --- END OF PAGINATION LOGIC ---

  // --- STATUS DROPDOWN LOGIC ---
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  // NEW: State to track which car is currently being updated
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (carId: string, newStatus: boolean) => {
    // Store the original state in case we need to revert on failure
    const originalCars = [...cars];

    // 1. Optimistic update: Update the UI immediately
    // This updates the client state which uses 'is_verified'
    setCars((prevCars) =>
      prevCars.map((car) =>
        car.id === carId ? { ...car, is_verified: newStatus } : car
      )
    );

    // 2. Set loading state and close dropdown
    setIsUpdatingId(carId);
    setOpenDropdownId(null);

    try {
      // 3. --- API CALL TO UPDATE DATABASE ---

      const response = await fetch(`/api/car/${carId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        // **THIS IS THE FIX:**
        // Send the boolean 'is_verified' key, not the string 'status'.
        body: JSON.stringify({
          is_verified: newStatus,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(
            // Use 'errorData.error' to match your API's error response
            errorData.error ||
              errorData.message ||
              "Failed to update status on server"
          );
        } else {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}. Check your API route.`
          );
        }
      }

      console.log("Status updated successfully for car:", carId);
    } catch (error) {
      // 4. --- REVERT ON FAILURE ---
      console.error("Failed to update status:", error);
      // Revert the state back to the original
      setCars(originalCars);
      // Here you could show an error toast to the user
    } finally {
      // --- CLEANUP ---
      // Remove loading state regardless of success or failure
      setIsUpdatingId(null);
    }
  };
  // --- END OF STATUS LOGIC ---

  if (cars.length === 0) {
    return (
      <p className="text-gray-600 text-center py-10">ไม่มีข้อมูลรถในระบบ</p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black">รถทั้งหมด</h1>

      {/* Car List */}
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
              {/* Block 1: Car Image */}
              <div className="w-64 flex-shrink-0">
                <img
                  src={car.image || "/placeholder-car.jpg"}
                  alt={car.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>

              {/* Block 2: Car Info (Name, Specs) */}
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

              {/* Block 3: Price */}
              <div className="text-center w-28 flex-1 pt-1 flex flex-col">
                <p className="font-semibold text-black">ราคา</p>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-700">{car.pricePerDay} / วัน</p>
                </div>
              </div>

              {/* Block 4: Status (UPDATED) */}
              <div className="text-center w-32 flex-1 pt-1 flex flex-col">
                <p className="font-semibold text-black mb-1">สถานะ</p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    {/* This span is the dropdown trigger */}
                    <span
                      onClick={() =>
                        // Disable opening dropdown if already updating
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
                      // Disable click if updating
                      aria-disabled={isUpdating}
                    >
                      {/* Show loading spinner or content */}
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

                    {/* The actual dropdown menu */}
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
                          // Disable if already verified or if any update is in progress
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
                          // Disable if already unverified or if any update is in progress
                          disabled={!isVerified || !!isUpdatingId}
                        >
                          Unverified
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Block 5: Rating */}
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

      {/* Dynamic Pagination */}
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