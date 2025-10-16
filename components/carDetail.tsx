"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

import { carAvailable } from "@/lib/carServices";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { dateRangeAvailable } from "@/lib/dateRangeAvailable";
import { createRenting } from "@/lib/rentingServices";
import type { Car } from "@/types/carInterface";

export function CarDetailsPage({ cid, car }: { cid: string; car?: Car | null }) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <main className="bg-gray-50 flex items-center justify-center min-h-screen p-10 font-mitr text-slate-800">
      <div className="flex w-full max-w-6xl gap-16">
        {/* === ซ้าย: รูป/ราคา/เลือกวัน === */}
        <div className="flex flex-col w-7/12">
          <h1 className="text-4xl font-bold text-slate-900">
            {car?.car_brand} {car?.model}
          </h1>

          <div className="inline-block px-5 py-2 mt-4 mb-8 font-semibold text-white bg-slate-900 rounded-full">
            {car?.daily_rental_price} บาท / วัน
          </div>

          <img
            src={car?.car_image}
            alt={`Car Image ${car?.car_id}`}
            className="w-full rounded-2xl object-cover shadow-xl"
          />

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
                onClick={async () => {
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
                    // ✅ validate ด้วย zod
                    const parsed = await dateRangeAvailable.parseAsync({
                      startDate,
                      endDate,
                    });

                    // ใช้ช่วงเวลาแบบ inclusive สำหรับเช็คว่าง
                    const start = dayjs(parsed.startDate)
                      .startOf("day")
                      .toDate();
                    const end = dayjs(parsed.endDate)
                      .startOf("day")
                      .add(1, "day")
                      .toDate();

                    const isAvailable = await carAvailable(
                      supabase,
                      cid,
                      start,
                      end
                    );

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
                      `/checkout?renting_id=${encodeURIComponent(
                        rentingId
                      )}&car_id=${encodeURIComponent(
                        cid
                      )}&sdate=${sdateStr}&edate=${edateStr}&days=${days}`
                    );
                  } catch (error: any) {
                    // ✅ ดึงเฉพาะข้อความจาก ZodError (หรือ error ทั่วไป)
                    const zodIssues = error?.errors ?? error?.issues;
                    const messages = Array.isArray(zodIssues) && zodIssues.length
                      ? zodIssues.map((e: any) => e.message).join("\n")
                      : error?.message ?? "เกิดข้อผิดพลาด";

                    toast({
                      variant: "destructive",
                      title: "เกิดข้อผิดพลาด",
                      description: messages, 
                    });
                  }
                }}
              >
                เช่ารถคันนี้
              </button>
            </div>
          </div>
        </div>

        {/* === ขวา: รายละเอียดรถ === */}
        <div className="w-5/12 pt-16">
          <h2 className="mb-6 text-3xl font-semibold text-slate-900">
            รายละเอียดของรถ
          </h2>

          <div className="text-base leading-loose text-slate-600 break-words">
            <div>
              {car?.car_brand} {car?.model}
            </div>
            <div>Mileage : {car?.mileage} km</div>
            <div>Seats : {car?.number_of_seats}</div>
            <div>Oil type : {car?.oil_type}</div>
            <div>Model year : {car?.year_created ?? car?.year ?? "ไม่ระบุ"}</div>
            <div>Pick-up Location : {car?.location}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
