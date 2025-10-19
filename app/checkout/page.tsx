"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getRentingById } from "@/lib/rentingServices";
import { getCarById } from "@/lib/carServices"; // ✅ ใช้ service ที่มีอยู่แล้ว
import { Calendar, MapPin, Clock } from "lucide-react";
import dayjs from "dayjs";
import type { RentingDetail } from "@/types/rentingInterface";

export default function OrderPage() {
  const sp = useSearchParams();
  const rentingId = sp.get("renting_id");
  const [renting, setRenting] = useState<RentingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRenting = async () => {
      if (!rentingId) return;
      const supabase = createClient();
      try {
        // ✅ ดึงข้อมูลการจอง
        const rentingData = await getRentingById(supabase, rentingId);

        // ✅ ดึงข้อมูลรถจาก service เดิม
        const carData = await getCarById(supabase, rentingData.car_id);

        // ✅ รวมข้อมูลก่อน setState
        setRenting({
          ...rentingData,
          car_information: carData,
        });
      } catch (error) {
        console.error("Error fetching renting data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRenting();
  }, [rentingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        กำลังโหลดข้อมูลการจอง...
      </div>
    );
  }

  if (!renting) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-600">
        ไม่พบข้อมูลการจอง
      </div>
    );
  }

  const car = renting.car_information;
  const sdate = dayjs(renting.sdate);
  const edate = dayjs(renting.edate);
  const days = edate.diff(sdate, "day") + 1;
  const total = (car?.daily_rental_price ?? 0) * days;

  return (
    <main className="flex-1 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">
            การจองรถยนต์ของคุณ
          </h1>
          <p className="text-2xl font-light text-gray-700">
            หมายเลขการจอง: {renting.renting_id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
                {sdate.format("DD/MM/YYYY")} – {edate.format("DD/MM/YYYY")}
              </div>
              <div className="text-gray-600">ระยะเวลา {days} วัน</div>
            </div>

            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-6">
              <img
                src={
                  car?.car_image ||
                  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=500&h=300&fit=crop"
                }
                alt={`Car ${car?.model}`}
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-black mt-1" />
                <div>
                  <p className="font-medium text-gray-900">วันที่รับรถ</p>
                  <p className="text-gray-600">{sdate.format("DD/MM/YYYY")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-black mt-1" />
                <div>
                  <p className="font-medium text-gray-900">วันที่คืนรถ</p>
                  <p className="text-gray-600">{edate.format("DD/MM/YYYY")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-black mt-1" />
                <div>
                  <p className="font-medium text-gray-900">สถานที่รับรถ</p>
                  <p className="text-gray-600">
                    {car?.location ?? "ไม่ระบุสถานที่"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-black mt-1" />
                <div>
                  <p className="font-medium text-gray-900">ระยะเวลาเช่า</p>
                  <p className="text-gray-600">{days} วัน</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ยอดชำระรวม
              </h2>
              <div className="space-y-3 mb-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {car?.car_brand} {car?.model}
                  </span>
                  <span>{car?.daily_rental_price?.toLocaleString()} บาท/วัน</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>จำนวนวัน</span>
                  <span>{days} วัน</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-black">
                    {total.toLocaleString()} บาท
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                เลือกวิธีการชำระเงิน
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-4 p-5 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
                  <img
                    src="/icons/qr_payment.png"
                    alt="QR Payment"
                    className="w-8 h-8"
                  />
                  <span className="font-semibold text-lg text-gray-900">
                    ชำระเงินด้วย QR Payment
                  </span>
                </button>

                <button className="w-full flex items-center justify-center gap-4 p-5 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
                  <img
                    src="/icons/true_money.png"
                    alt="True Wallet"
                    className="w-8 h-8"
                  />
                  <span className="font-semibold text-lg text-gray-900">
                    ชำระเงินด้วย True Wallet
                  </span>
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                กรุณาชำระเงินภายใน 24 ชั่วโมง
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
