"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Star, Users, Fuel, Settings, Calendar } from "lucide-react";
import type { CarCardProps } from "@/types/carInterface";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function CarCard({
  id,
  name,
  model,
  image,
  pricePerDay,
  rating: initialRating,
  reviewCount: initialReviewCount,
  seats,
  fuelType,
  transmission,
  availability,
  features = [],
  year_created,
}: CarCardProps) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [reviewCount, setReviewCount] = useState<number>(initialReviewCount ?? 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarRating = async () => {
      try {
        const supabase = createClient();
        
        // Fetch all reviews for this specific car
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('target_id', id); // target_id is the car_id

        if (error) {
          console.error('Error fetching reviews for car:', id, error);
          setLoading(false);
          return;
        }

        if (reviews && reviews.length > 0) {
          // Calculate average rating
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = totalRating / reviews.length;
          
          setRating(avgRating);
          setReviewCount(reviews.length);
        } else {
          // No reviews yet
          setRating(0);
          setReviewCount(0);
        }
      } catch (error) {
        console.error('Error in fetchCarRating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarRating();
  }, [id]);

  const isAvailable = availability === "พร้อมเช่า";
  const badgeClass = isAvailable
    ? "bg-emerald-50 text-emerald-700"
    : "bg-gray-100 text-gray-600";

  const hasImage = !!image && image.trim() !== "";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Car Image */}
      <div className="relative h-48 bg-gray-50">
        {hasImage ? (
          <Image
            src={image as string}
            alt={`${name} ${model}`}
            fill={true}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-gray-400 text-sm">
            ไม่มีรูปภาพ
          </div>
        )}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
        >
          {availability}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Car Name & Model */}
        <div>
          <h3 className="font-bold text-lg text-black leading-tight">{name}</h3>
          <p className="text-gray-600 text-sm">{model}</p>
          {year_created ? (
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <Calendar className="h-4 w-4" />
              <span>ปี {year_created}</span>
            </div>
          ) : null}
        </div>

        {/* Rating - Now fetched dynamically */}
        <div className="flex items-center gap-1" aria-label="rating">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {loading ? (
            <span className="text-sm text-gray-400">กำลังโหลด...</span>
          ) : (
            <>
              <span className="text-sm font-medium">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({reviewCount.toLocaleString()} รีวิว)
              </span>
            </>
          )}
        </div>

        {/* Icons Row */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1" title="ที่นั่ง">
            <Users className="h-4 w-4" />
            <span>{seats} ที่นั่ง</span>
          </div>
          <div className="flex items-center gap-1" title="ประเภทเชื้อเพลิง">
            <Fuel className="h-4 w-4" />
            <span>{fuelType}</span>
          </div>
          <div className="flex items-center gap-1" title="ระบบเกียร์">
            <Settings className="h-4 w-4" />
            <span>{transmission}</span>
          </div>
        </div>

        {/* Feature chips (max 3) */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 3).map((feature, idx) => (
              <span
                key={`${feature}-${idx}`}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{features.length - 3} อื่นๆ
              </span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-black">
              ฿{Number(pricePerDay).toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">/วัน</span>
          </div>

          <Button
            asChild={isAvailable}
            size="sm"
            disabled={!isAvailable}
            className={
              isAvailable
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
            title={
              isAvailable
                ? "คลิกเพื่อดูรายละเอียดรถ"
                : "รถคันนี้ถูกจองล่วงหน้า ไม่สามารถเช่าได้ในขณะนี้"
            }
          >
            {isAvailable ? (
              <Link href={`/car/${encodeURIComponent(id)}`}>เช่าเลย</Link>
            ) : (
              <span>ไม่พร้อมเช่า</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}