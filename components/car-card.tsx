import Image from "next/image";
import { Button } from "./ui/button";
import { Star, Users, Fuel, Settings } from "lucide-react";

interface CarCardProps {
  id: string;
  name: string;
  model: string;
  image: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  seats: number;
  fuelType: string;
  transmission: string;
  availability: string;
  features: string[];
}

export function CarCard({
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
  features,
}: CarCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Car Image */}
      <div className="relative h-48 bg-gray-50">
        <Image
          src={image}
          alt={`${name} ${model}`}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
          {availability}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Car Name & Model */}
        <div>
          <h3 className="font-bold text-lg text-black">{name}</h3>
          <p className="text-gray-600 text-sm">{model}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-sm text-gray-500">({reviewCount} รีวิว)</span>
        </div>

        {/* Car Features */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{seats} ที่นั่ง</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            <span>{fuelType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>{transmission}</span>
          </div>
        </div>

        {/* Features List */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="text-xs text-gray-500">+{features.length - 3} อื่นๆ</span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-black">฿{pricePerDay.toLocaleString()}</span>
            <span className="text-sm text-gray-600">/วัน</span>
          </div>
          <Button variant="default" size="sm">
            เช่าเลย
          </Button>
        </div>
      </div>
    </div>
  );
}