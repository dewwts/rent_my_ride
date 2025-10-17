import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Star, Users, Fuel, Settings } from "lucide-react";
import type { CarCardProps } from "@/types/carInterface";

export function CarCard({
  id,
  name,
  model,
  image,
  pricePerDay,
  rating,
  reviewCount,
  seats,
  fuelType,
  transmission,
  availability,
  features = [],
}: CarCardProps) {
  // badge color by availability
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
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // ถ้ายังมีปัญหา host ภาพ ให้ตั้ง images.remotePatterns ใน next.config.*
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-gray-400 text-sm">
            ไม่มีรูปภาพ
          </div>
        )}

        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
          {availability}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Car Name & Model */}
        <div>
          <h3 className="font-bold text-lg text-black leading-tight">{name}</h3>
          <p className="text-gray-600 text-sm">{model}</p>
        </div>

        {/* Rating (match first component’s feel) */}
        <div className="flex items-center gap-1" aria-label="rating">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-sm text-gray-500">({reviewCount} รีวิว)</span>
        </div>

        {/* Car Features (icons row) */}
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
              ฿{pricePerDay.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">/วัน</span>
          </div>

          {/* (Optional) deep link to car details using id */}
          <Button asChild size="sm">
            <Link href={`/car/${id}`} aria-label={`เช่า ${name} ${model}`}>
              เช่าเลย
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
