"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { z } from "zod";
import { CarSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "./ui/use-toast";
import { uploadImageCar } from "@/lib/carServices";
import { Car } from "@/types/carInterface";
import { AddCarFormProps } from "@/types/componentProps";

type CarFormValues = z.infer<typeof CarSchema>;

export function AddCarForm({
  className,
  onCarAdded,
  onCancel,
  ...props
}: AddCarFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CarFormValues>({
    resolver: zodResolver(CarSchema) as any,
    mode: "onTouched",
    defaultValues: {
      brand: "",
      model: "",
      car_id: "",
      year: new Date().getFullYear(),
      seats: 4,
      car_type: "",
      color: "",
      mileage: 0,
      oil_type: "",
      gear_type: "",
      price_per_day: 0,
      status: "available",
      location: "",
      rating: 0,
      image_url: "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
      });
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "ไฟล์ใหญ่เกินไป",
        description: "กรุณาเลือกไฟล์ขนาดไม่เกิน 20MB",
      });
      return;
    }

    setUploading(true);
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Generate unique car ID for upload
      const carId = `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Upload image
      const imageUrl = await uploadImageCar(supabase, file, carId);
      setValue("image_url", imageUrl);
      
      toast({
        title: "อัปโหลดสำเร็จ",
        description: "รูปภาพรถถูกอัปโหลดเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "อัปโหลดไม่สำเร็จ",
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด",
      });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCar = async (data: CarFormValues) => {
    setIsLoading(true);
    try {
      // Here you would typically save to your database
      // For now, we'll just simulate success
      const newCar: Car = {
        id: `car_${Date.now()}`,
        ...data,
        rating: data.rating || 0,
        image_url: data.image_url || "",
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "เพิ่มรถสำเร็จ",
        description: `รถ ${data.brand} ${data.model} ถูกเพิ่มเรียบร้อยแล้ว`,
      });

      onCarAdded?.(newCar);
    } catch (error) {
      console.error("Add car error:", error);
      toast({
        variant: "destructive",
        title: "เพิ่มรถไม่สำเร็จ",
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเพิ่มรถ",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-white rounded-xl shadow-sm border p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            ← ย้อนกลับ
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">ข้อมูลพื้นฐานรถ</h1>
        </div>

        <form onSubmit={handleSubmit(handleAddCar)} className="space-y-8">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">รูปภาพรถ</Label>
            <div className="flex items-center gap-6">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Image Preview or Upload Area */}
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Car preview"
                    className="w-64 h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      setImagePreview(null);
                      setValue("image_url", "");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="w-64 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 text-center">อัปโหลดรูปภาพรถ</p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-2"
                >
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
                </Button>
                <p className="text-xs text-gray-500">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 20MB</p>
              </div>
            </div>
          </div>

            {/* Basic Car Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐานรถ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">ยี่ห้อรถ *</Label>
                  <Input
                    id="brand"
                    {...register("brand")}
                    placeholder="เช่น Honda, Toyota, Mazda"
                  />
                  {errors.brand && (
                    <p className="text-sm text-red-500">{errors.brand.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">รุ่นรถ *</Label>
                  <Input
                    id="model"
                    {...register("model")}
                    placeholder="เช่น Civic, Yaris, CX-5"
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500">{errors.model.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">ปีที่ผลิต *</Label>
                  <select
                    id="year"
                    {...register("year")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    {Array.from({ length: 35 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  {errors.year && (
                    <p className="text-sm text-red-500">{errors.year.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_id">เลขตัวถัง (ค.) *</Label>
                  <Input
                    id="car_id"
                    {...register("car_id")}
                    placeholder="เช่น XXXXXXXXXX"
                  />
                  {errors.car_id && (
                    <p className="text-sm text-red-500">{errors.car_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">จำนวนที่นั่ง *</Label>
                  <select
                    id="seats"
                    {...register("seats")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    {Array.from({ length: 50 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {errors.seats && (
                    <p className="text-sm text-red-500">{errors.seats.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="car_type">ประเภทรถ *</Label>
                  <select
                    id="car_type"
                    {...register("car_type")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="">เลือกประเภทรถ</option>
                    <option value="เก๋ง">เก๋ง</option>
                    <option value="SUV">SUV</option>
                    <option value="รถตู้">รถตู้</option>
                    <option value="รถกระบะ">รถกระบะ</option>
                    <option value="รถสปอร์ต">รถสปอร์ต</option>
                    <option value="รถไฟฟ้า">รถไฟฟ้า</option>
                  </select>
                  {errors.car_type && (
                    <p className="text-sm text-red-500">{errors.car_type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">สี *</Label>
                  <Input
                    id="color"
                    {...register("color")}
                    placeholder="เช่น ขาว, ดำ, แดง"
                  />
                  {errors.color && (
                    <p className="text-sm text-red-500">{errors.color.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oil_type">ประเภทเชื้อเพลิง *</Label>
                  <select
                    id="oil_type"
                    {...register("oil_type")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="">เลือกประเภทเชื้อเพลิง</option>
                    <option value="เบนซิน">เบนซิน</option>
                    <option value="ดีเซล">ดีเซล</option>
                    <option value="ไฟฟ้า">ไฟฟ้า</option>
                    <option value="ไฮบริด">ไฮบริด</option>
                    <option value="แก๊ส">แก๊ส</option>
                  </select>
                  {errors.oil_type && (
                    <p className="text-sm text-red-500">{errors.oil_type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gear_type">ระบบเกียร์ *</Label>
                  <select
                    id="gear_type"
                    {...register("gear_type")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="">เลือกระบบเกียร์</option>
                    <option value="ออโต้">ออโต้</option>
                    <option value="กระปุก">กระปุก</option>
                    <option value="กึ่งออโต้">กึ่งออโต้</option>
                  </select>
                  {errors.gear_type && (
                    <p className="text-sm text-red-500">{errors.gear_type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">เลขไมล์ปัจจุบัน (km) *</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    max="999999"
                    {...register("mileage")}
                    placeholder="เช่น 120000"
                  />
                  {errors.mileage && (
                    <p className="text-sm text-red-500">{errors.mileage.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลเพิ่มเติม</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ *</Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="available">ว่าง</option>
                    <option value="unavailable">ไม่ว่าง</option>
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_day">ราคาเช่าต่อวัน (บาท) *</Label>
                  <Input
                    id="price_per_day"
                    type="number"
                    min="1"
                    max="100000"
                    {...register("price_per_day")}
                    placeholder="เช่น 1200"
                  />
                  {errors.price_per_day && (
                    <p className="text-sm text-red-500">{errors.price_per_day.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">สถานที่ *</Label>
                  <select
                    id="location"
                    {...register("location")}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="">เลือกสถานที่</option>
                    <option value="กรุงเทพฯ">กรุงเทพฯ</option>
                    <option value="เชียงใหม่">เชียงใหม่</option>
                    <option value="ภูเก็ต">ภูเก็ต</option>
                    <option value="พัทยา">พัทยา</option>
                    <option value="หัวหิน">หัวหิน</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="px-8 py-2"
              >
                ยกเลิก
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              {isLoading ? "กำลังเพิ่มรถ..." : "เพิ่มรถใหม่"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
