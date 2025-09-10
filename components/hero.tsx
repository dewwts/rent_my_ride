import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, MapPin, Calendar } from "lucide-react";

export function Hero() {
  return (
    <div className="w-full max-w-5xl mx-auto text-center space-y-8">
      {/* Hero Text - More minimal */}
      <div className="space-y-4">
        <h1 className=" font-medium text-4xl md:text-5xl text-black">
          เช่ารถง่าย ใช้ได้จริง
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          เลือกรถที่ใช่ สำหรับทุกการเดินทาง
        </p>
      </div>

      {/* Modern Search Bar - Simplified */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Location Input */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="เลือกสถานที่รับรถ"
              className="pl-10 h-12 border-gray-200 focus:border-black focus:ring-0"
            />
          </div>

          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 h-12 border-gray-200 focus:border-black focus:ring-0"
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 h-12 border-gray-200 focus:border-black focus:ring-0"
              />
            </div>
          </div>

          {/* Search Button */}
          <Button variant="default" size="lg">
            <Search className="h-5 w-5 mr-2" />
            ค้นหา
          </Button>
        </div>
      </div>
    </div>
  );
}
