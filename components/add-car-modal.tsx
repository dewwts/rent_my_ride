"use client";

import { useState } from "react";
import { AddCarForm } from "./add-car-form";
import { Car } from "@/types/carInterface";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded?: (car: Car) => void;
}

export function AddCarModal({ isOpen, onClose, onCarAdded }: AddCarModalProps) {
  if (!isOpen) return null;

  const handleCarAdded = (car: Car) => {
    onCarAdded?.(car);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">เพิ่มรถใหม่</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          <AddCarForm 
            onCarAdded={handleCarAdded}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
