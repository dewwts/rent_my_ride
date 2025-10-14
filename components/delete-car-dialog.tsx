"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car } from "@/types/carInterface";
import { DeleteCarDialogProps } from "@/types/componentProps";

export function DeleteCarDialog({
  isOpen,
  onClose,
  onConfirm,
  car,
  isLoading = false,
}: DeleteCarDialogProps) {
  if (!isOpen || !car) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ยืนยันการลบรถ
          </h3>
          <p className="text-gray-600 mb-6">
            คุณต้องการลบรถ {car.brand} {car.model} ID: {car.car_id} ใช่หรือไม่?
          </p>
          <p className="text-sm text-red-600 mb-6">
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6"
            >
              {isLoading ? "กำลังลบ..." : "ลบ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
