"use client"

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from "react";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import { carAvailable } from "@/lib/carServices";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { dateRangeAvailable } from "@/lib/dateRangeAvailable";
import {Car} from "@/types/carInterface";
import { da } from "zod/v4/locales";


export function CarDetailsPage({cid,car}:{cid:string, car?:Car|null}) {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const { toast } = useToast();

    return (
        <main className="bg-gray-50 flex items-center justify-center min-h-screen p-10 font-mitr text-slate-800">
        
      {/* Card ที่ครอบเนื้อหาทั้งหมด */}
      <div className="flex w-full max-w-6xl gap-16">
        
        {/* === คอลัมน์ซ้าย === */}
        <div className="flex flex-col w-7/12">
          
              <h1 className="text-4xl font-bold text-slate-900">{car?.car_brand} {car?.model}</h1>

          <div className="inline-block px-5 py-2 mt-4 mb-8 font-semibold text-white bg-slate-900 rounded-full">
              {car?.daily_rental_price} บาท / วัน
          </div>

          <img
            src={car?.car_image}
            alt={`Car Image ${car?.car_id}`}
            className="w-full rounded-2xl object-cover shadow-xl"
          />

          {/* ส่วนปุ่มและวันที่ */}
          <div className="flex items-center gap-2 mt-6">
            {/*<div className="flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white py-3 px-5">
            </div>*/}
            {/* ปฏิทินเลือกวันที่ */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker 
                label="วันเริ่มต้นการเช่า" 
                className="bg-white rounded-md"
                value={startDate}
                onChange={(value) => {
                    setStartDate(value);
                    toast({
                    variant:'default',
                    title:"วันที่เริ่มต้นการเช่า",
                    description:value ? value.format('DD/MM/YYYY') : 'No date selected'
                  })
                }}
                />
            </LocalizationProvider>
             <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker 
                label="วันสิ้นสุดการเช่า" 
                className="bg-white rounded-md"
                value={endDate}
                onChange={(value) => {
                    setEndDate(value);
                  toast({
                    variant:'default',
                    title:"วันที่สิ้นสุดการเช่า",
                    description:value ? value.format('DD/MM/YYYY') : 'No date selected'
                  })
                }}
                />
            </LocalizationProvider>
 
            <div className="flex cursor-pointer items-center rounded-full bg-slate-900 p-1 shadow-md transition-colors hover:bg-slate-800">

              <button className="py-2 pl-2 pr-2 text-white" onClick={async()=>{
                 if(!startDate || !endDate){
                      toast({
                      variant:'destructive',
                      title:"วันที่ไม่ครบ",
                      description:"กรุณาเลือกวันที่ให้ครบ"
                      })
                      return;
                  }
                  const supabase = createClient();
                  try{
                    const parsed = await dateRangeAvailable.parseAsync({ startDate,endDate});
                    const start = dayjs(parsed.startDate).startOf("day").toDate();
                    const end = dayjs(parsed.endDate).startOf("day").add(1, "day").toDate();
                    const isAvailable = await carAvailable(supabase,cid, start, end);
                    if (isAvailable) {
                      // คำนวนวันและราคาอย่างปลอดภัย โดยใช้ค่า parsed ที่ผ่านการ validate แล้ว
                      const parsedStart = dayjs(parsed.startDate);
                      const parsedEnd = dayjs(parsed.endDate);
                      const days = parsedEnd.diff(parsedStart, "day") + 1;
                      const dailyPrice = (car?.daily_rental_price ?? 0);
                      const price = dailyPrice * days;

                      // แสดง toast ยืนยัน
                      toast({
                        variant: 'default',
                        title: "ยืนยันข้อมูล",
                        description: `คุณได้เลือกจองรถยนต์คันนี้ตั้งแต่ ${parsedStart.format('DD/MM/YYYY')} ถึง ${parsedEnd.format('DD/MM/YYYY')} ราคาสุทธิ ${price} บาท`
                      });

                      // (ถ้าต้องการบันทึกการจองลงฐานข้อมูล ให้เรียก supabase.insert ที่นี่)
                      // const { data: booking, error: insertErr } = await supabase
                      //   .from('bookings')
                      //   .insert({ car_id: cid, start_date: start, end_date: end, total_price: price });
                      // if (insertErr) {
                      //   toast({ variant: 'destructive', title: 'การจองไม่สำเร็จ', description: insertErr.message });
                      // } else {
                      //   toast({ variant: 'success', title: 'จองสำเร็จ', description: 'ระบบบันทึกการจองเรียบร้อย' });
                      // }
                    } else {
                      toast({variant:'destructive',title:"การจองไม่สำเร็จ",
                      description:"รถยนต์นี้ไม่ว่างในช่วงเวลาที่เลือก"});
                    }
                  } catch (error: any) {
                      if (error?.issues.length > 0) {
                        toast({variant: 'destructive', title: 'เกิดข้อผิดพลาด',
                          description: error.issues[0].message,});
                        return;
                      }
                      else {
                        toast({variant: 'destructive',title: 'เกิดข้อผิดพลาด',
                          description: error.message,});
                        return;
                      }
                    } 
              }}>
                เช่ารถคันนี้
              </button>
            </div>
          </div>
        </div>

        {/* === คอลัมน์ขวา === */}
        <div className="w-5/12 pt-16">

          <h2 className="mb-6 text-3xl font-semibold text-slate-900">
            รายละเอียดของรถ
          </h2>
          
          <div className="text-base leading-loose text-slate-600 break-words">
              <div>{car?.car_brand} {car?.model} </div>
              <div>Mileage : {car?.mileage} km</div>
              <div>Seats : {car?.number_of_seats} </div>
              <div>Oil type : {car?.oil_type}</div>
              <div>Colors : {car?.color}</div>
              <div>Model year : {car?.year}</div>
              <div>Pick-up Location : {car?.location}</div>
              
          </div>
        </div>
        
      </div>
    </main>
    )
}