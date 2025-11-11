"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { z } from "zod";
import { CarSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "./ui/use-toast";
import { Car } from "@/types/carInterface";
import { EditCarFormProps } from "@/types/componentProps";
import Image from "next/image";

type CarFormValues = z.infer<typeof CarSchema>;

export function EditCarForm({
  car,
  onCarUpdated,
  onCancel,
  isLoading = false,
  className,
  ...props
}: EditCarFormProps & React.ComponentPropsWithoutRef<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(car.car_image || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CarFormValues>({
    resolver: zodResolver(CarSchema),
    mode: "onTouched",
    defaultValues: {
      car_brand: car.car_brand,
      model: car.model,
      year_created: car.year_created,
      number_of_seats: car.number_of_seats,
      car_type: car.car_type,
      mileage: car.mileage,
      oil_type: car.oil_type,
      gear_type: car.gear_type,
      daily_rental_price: car.daily_rental_price ,
      // status: car.status,
      location: car.location,
      rating: car.rating || 0,
      image_url: car.car_image || "",
    },
  });
  // console.log(car.year_created);
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

      setImage(file)
   
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
      setImagePreview(car.car_image || null);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCar = async (data: CarFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedCar: Car = {
        ...car,
        ...data,
        rating: data.rating || car.rating,
        car_image: data.image_url || car.car_image
      };
      onCarUpdated?.(updatedCar, image);
    } catch (error) {
      console.error("Update car error:", error);
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleSubmit(handleUpdateCar)} className="space-y-8">
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
              
              {/* Image Display/Upload Area */}
              {imagePreview ? (
                <div className="relative w-full h-48">
                  <Image
                    src={imagePreview}
                    alt="Car preview"
                    fill={true}
                    className="object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      setImagePreview(car.car_image || null);
                      setValue("image_url", car.car_image || "");
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
                  {...register("car_brand")}
                  placeholder="เช่น Honda, Toyota, Mazda"
                />
                {errors.car_brand && (
                  <p className="text-sm text-red-500">{errors.car_brand.message}</p>
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
                  id="year_created"
                  {...register("year_created",{ valueAsNumber: true })}
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
                {errors.year_created && (
                  <p className="text-sm text-red-500">{errors.year_created.message}</p>
                )}
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="car_id">เลขตัวถัง (ค.) *</Label>
                <Input
                  id="car_id"
                  {...register("car_id")}
                  placeholder="เช่น XXXXXXXXXX"
                />
                {errors.car_id && (
                  <p className="text-sm text-red-500">{errors.car_id.message}</p>
                )}
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="seats">จำนวนที่นั่ง *</Label>
                <select
                  id="seats"
                  {...register("number_of_seats",{ valueAsNumber: true })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  {Array.from({ length: 50 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                {errors.number_of_seats && (
                  <p className="text-sm text-red-500">{errors.number_of_seats.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div className="space-y-2">
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
              </div> */}
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
              {/* <div className="space-y-2">
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
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="price_per_day">ราคาเช่าต่อวัน (บาท) *</Label>
                <Input
                  id="price_per_day"
                  type="number"
                  min="1"
                  max="100000"
                  {...register("daily_rental_price",{valueAsNumber:true})}
                  placeholder="เช่น 1200"
                />
                {errors.daily_rental_price && (
                  <p className="text-sm text-red-500">{errors.daily_rental_price.message}</p>
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
              {isLoading || isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
