"use client"

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from "react";
import { Dayjs } from "dayjs";
import { carAvailable } from "@/lib/carAvailable";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function CarDetailsPage({cid}:{cid:string}) {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const { toast } = useToast();

    return (
        <main className="bg-gray-50 flex items-center justify-center min-h-screen p-10 font-mitr text-slate-800">
        
      {/* Card ที่ครอบเนื้อหาทั้งหมด */}
      <div className="flex w-full max-w-6xl gap-16">
        
        {/* === คอลัมน์ซ้าย === */}
        <div className="flex flex-col w-7/12">
          
          <h1 className="text-4xl font-bold text-slate-900">ชื่อรถยนต์</h1>

          <div className="inline-block px-5 py-2 mt-4 mb-8 font-semibold text-white bg-slate-900 rounded-full">
             2222 บาท / วัน
          </div>

          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop"
            alt="Car Image idxxx"
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
                  if(endDate.isBefore(startDate)){
                     toast({
                    variant:'destructive',
                    title:"วันที่ไม่ถูกต้อง",
                    description:"วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่มต้น"
                  })
                      return;
                  }
                  const supabase = createClient();

                  const isAvailable = await carAvailable(supabase,cid, startDate.startOf('day').toDate(), endDate.startOf('day').toDate());
                  if (isAvailable) {
                      toast({
                    variant:'default',
                    title:"ยืนยันข้อมูล",
                    description:`คุณได้เลือกจองรถยนต์คันนี้ตั้งแต่ ${startDate.format('DD/MM/YYYY')} ถึง ${endDate.format('DD/MM/YYYY')}`
                  })
                  } else {
                      toast({
                    variant:'destructive',
                    title:"การจองไม่สำเร็จ",
                    description:"รถยนต์นี้ไม่ว่างในช่วงเวลาที่เลือก"
                  })
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
          
          <p className="text-base leading-loose text-slate-600 break-words">
            xxx000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
          </p>
        </div>
        
      </div>
    </main>
    )
}