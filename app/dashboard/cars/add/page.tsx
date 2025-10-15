"use client";

import { useRouter } from "next/navigation";
import { AddCarForm } from "@/components/add-car-form";
import { Car } from "@/types/carInterface";

export default function AddCarPage() {
  const router = useRouter();

  const handleCarAdded = (car: Car) => {
    // Redirect back to cars list after successful addition
    router.push("/dashboard/cars");
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
