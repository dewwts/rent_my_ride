"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

import { carAvailable, getCarStatus } from "@/lib/carServices";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { dateRangeAvailable } from "@/lib/utils";
import { createRenting } from "@/lib/rentingServices";
import type { Car } from "@/types/carInterface";
import Image from "next/image";


export function CarDetailsPage({
  cid,
  car,
}: {
  cid: string;
  car?: Car | null;
}) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const handleClick = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "วันที่ไม่ครบ",
        description: "กรุณาเลือกวันที่ให้ครบ",
      });
      return;
    }
    const supabase = createClient();
    try {
      const carStatus = await getCarStatus(supabase, cid)
      if (!carStatus){
        toast({
          variant: "destructive",
          title: "วันที่ไม่ครบ",
          description: "รถคันนี้ไม่สามารถจองได้",
        });
        return;
      }
      const parsed = await dateRangeAvailable.parseAsync({
        startDate,
        endDate,
      });

      // ใช้ช่วงเวลาแบบ inclusive สำหรับเช็คว่าง
      const start = dayjs(parsed.startDate).startOf("day").toDate();
      const end = dayjs(parsed.endDate).startOf("day").add(1, "day").toDate();

      const isAvailable = await carAvailable(supabase, cid, start, end);
      if (!isAvailable) {
        toast({
          variant: "destructive",
          title: "การจองไม่สำเร็จ",
          description: "รถยนต์นี้ไม่ว่างในช่วงเวลาที่เลือก",
        });
        return;
      }

      // จำนวนวัน (inclusive)
      const parsedStart = dayjs(parsed.startDate);
      const parsedEnd = dayjs(parsed.endDate);
      const days = parsedEnd.diff(parsedStart, "day") + 1;

      const sdateStr = parsedStart.format("YYYY-MM-DD");
      const edateStr = parsedEnd.format("YYYY-MM-DD");

      const renting = await createRenting(supabase, {
        car_id: cid,
        sdate: sdateStr,
        edate: edateStr,
      });

      const rentingId = renting?.renting_id;

      toast({
        variant: "default",
        title: "จองสำเร็จ!",
        description: `คุณได้จองรถตั้งแต่ ${parsedStart.format(
          "DD/MM/YYYY"
        )} ถึง ${parsedEnd.format("DD/MM/YYYY")} จำนวน ${days} วัน`,
      });

      // ไปหน้า checkout พร้อม query ที่ต้องใช้
      router.push(
        `/checkout/${encodeURIComponent(
          rentingId
        )}`
      );
    } catch (error: unknown) {
      let message = "Something went wrong"
      if (error instanceof Error){
        message = error.message
      }
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: message,
      });
    }
  };
  return (
    <main className="bg-gray-50 flex flex-col items-center min-h-screen p-10 font-mitr text-slate-800">
      <div className="flex w-full max-w-6xl gap-16">
        {/* === ซ้าย: รูป/ราคา/เลือกวัน === */}
        <div className="flex flex-col w-7/12">
          <h1 className="text-4xl font-bold text-slate-900">
            {car?.car_brand} {car?.model}
          </h1>

          <div className="w-fit px-5 py-2 mt-4 mb-8 font-semibold text-white bg-slate-900 rounded-full">
            {car?.daily_rental_price} บาท / วัน
          </div>
          <div className="w-full aspect-video relative">
            {car?.car_image ? (
              <Image
              src={car?.car_image}
              alt={`Car Image ${car?.car_id}`}
              fill={true}
              className="rounded-2xl object-cover shadow-xl"
            />):(
              <div className="w-full rounded-2xl object-cover shadow-xl text-center font-light tracking-wide">
                ไม่มีรูปภาพ
              </div>
            )}
          </div>
          
          

          {/* เลือกวัน + ปุ่มเช่า */}
          <div className="flex items-center gap-2 mt-6">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="วันเริ่มต้นการเช่า"
                className="bg-white rounded-md"
                value={startDate}
                onChange={(v) => setStartDate(v)} // ❌ ไม่ toast ตอนเลือก
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="วันสิ้นสุดการเช่า"
                className="bg-white rounded-md"
                value={endDate}
                onChange={(v) => setEndDate(v)} // ❌ ไม่ toast ตอนเลือก
              />
            </LocalizationProvider>

            <div className="flex cursor-pointer items-center rounded-full bg-slate-900 p-1 shadow-md transition-colors hover:bg-slate-800">
              <button
                className="py-2 pl-2 pr-2 text-white"
                onClick={handleClick}
              >
                เช่ารถคันนี้
              </button>
            </div>
          </div>
        </div>

        {/* === ขวา: รายละเอียดรถ === */}
        <div className="w-5/12 pt-16 ">
          

          <div className="text-base leading-loose text-slate-600 break-words">
            <h2 className=" mb-6 text-3xl font-semibold text-slate-900 pt-16">
              รายละเอียดของรถ
            </h2>
            <div>
              {car?.car_brand} {car?.model}
            </div>
            <div>Mileage : {car?.mileage} km</div>
            <div>Seats : {car?.number_of_seats}</div>
            <div>Oil type : {car?.oil_type}</div>
            <div>
              Model year : {car?.year_created ?? car?.year_created ?? "ไม่ระบุ"}
            </div>
            <div>Pick-up Location : {car?.location}</div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-6xl mt-6 space-y-3">
        {/* Review Input Section */}
        <div className="rounded-2xl p-6 ">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">รีวิวการเช่าของคุณ</h2>
          
          <div className="relative">
            <textarea 
              placeholder="เพิ่มความคิดเห็นของคุณ..................................................................................."
              className="w-full h-32 p-4 border-2 border-black rounded-xl resize-none focus:outline-none focus:border-blue-500 text-slate-600"
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 cursor-pointer transition-colors ${
                      star <= (hover || rating) ? "fill-yellow-400" : "fill-gray-300"
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              
              <button className="px-4 py-1.5 bg-slate-600 text-white rounded-full hover:bg-black transition-colors font-light text-md">
                ส่ง
              </button>
            </div>
          </div>
        </div>
        
      
        {/* Reviews Display Section */}
        <div className=" rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">คะแนนการรีวิว</h2>
            <svg className="w-7 h-7 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="text-xl font-bold text-slate-900">4.8</span>
            <span className="text-sm text-slate-500">(100 รีวิว)</span>
          </div>

          <div className="space-y-4">
            {/* Individual Review 1 */}
            <div className="border-2 border-black rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">Userrr Nameee</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <svg key={star} className="w-5 h-5 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    {[4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 fill-gray-300" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-500">สร้างเมื่อ 15/10/2025</span>
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                ดีมากกกกกกกกกกกก ดีเร็วดดดดดดดดดดดดดด ดีเยี่ยมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมม<br />
                ดีมากกกกกกกกกกกก ดีเร็วดดดดดดดดดดดดดด ดีเยี่ยมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมม<br />
                ดีมากกกกกกกกกกกก ดีเร็วดดดดดดดดดดดดดด ดีเยี่ยมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมม
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <button className="text-slate-400 hover:text-black text-sm font-medium underline">
              แสดงเพิ่มเติม
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
