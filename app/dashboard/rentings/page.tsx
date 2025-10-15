"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, History } from "lucide-react"; // เพิ่ม ChevronLeft, ChevronRight
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from '@/lib/utils' 
import { rentingInfo,RentingStatus } from "@/types/rentingInterface";
import { getMyLeasingHistory,getRentingPrice } from "@/lib/rentingServices";
import { getFirstname } from "@/lib/userServices";
import CustomPagination from "@/components/customPagination"
import Link from "next/link";

export default function RentingHistoryPage() { 
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10; 
  const supabase = createClient();

  const fetchOwnerBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyLeasingHistory(supabase);
      setTotalCount(data.length);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = data.slice(start, end);

      const LeasingWithPriceandName = await Promise.all(
        pageData.map(async (leasing) => {
          const lessee_name = await getFirstname(supabase,leasing.lessee_id)
          try {
            const price = await getRentingPrice(supabase, leasing.renting_id);
            return { ...leasing, total_price: price ?? 0 ,lessee_name}; //add total price field and lessee_name
          } catch (err) {
            console.error("Error fetching price for", leasing.renting_id);
            return { ...leasing, total_price: 0 ,lessee_name}; // fallback
          }
        })
      );

    setBookings(LeasingWithPriceandName);
      
    } catch (err) {
      console.log(err)
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการให้เช่า');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchOwnerBookings(); 
  }, [currentPage, fetchOwnerBookings]);
  
  // UI Logic สำหรับ Status (คงเดิม)
  const getStatusDisplay = (status: rentingInfo['status']) => {
    if(status === RentingStatus.CONFIRMED){
      return "ยืนยัน"
    }
    else{
      return "รอดำเนินการ"
    }
  };

  const getStatusColor = (status: rentingInfo['status']) => {
    if(status === RentingStatus.CONFIRMED){
      return "text-green-700 bg-green-100"
    }
    else{
      return "text-amber-700 bg-amber-100"
    }
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center" style={{ backgroundColor: '#c9d1d9' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#2B09F7]" />
          <p className="text-gray-600">กำลังโหลดประวัติการให้เช่า...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6" style={{ backgroundColor: '#c9d1d9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error}</p>
          </div>
        </div>
      </main>
    );
  }

return (
  <main className="min-h-screen" style={{ backgroundColor: '#D4E0E6' }}>
    <div className="p-2 sm:p-5 m-0 sm:m-5">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center sm:text-left">
        ประวัติการให้เช่าทั้งหมด
      </h2>

      {/* พื้นหลังขาว */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
        
        {/* Header: แสดงเฉพาะในหน้าจอขนาด sm ขึ้นไป */}
        <div className="hidden sm:grid grid-cols-7 gap-4 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
          <div>หมายเลขการเช่า</div>
          <div>ID รถ</div>
          <div>ผู้เช่า</div>
          <div className="col-span-2">วันที่เช่า</div>
          <div>สถานะ</div>
          <div className="text-right">รายได้</div>
        </div>

        {/* Table Body / Card List */}
        <div className="space-y-3 mt-2">
          {bookings.map((booking) => (
            <div
              key={booking.renting_id}
              className="rounded-lg bg-[#F0F0F0] text-gray-800 transition hover:bg-[#E5E7F9] border border-gray-300 p-4 sm:p-3 sm:grid sm:grid-cols-7 sm:gap-4"
            >
              {/* Mobile Layout */}
              <div className="flex flex-col gap-1 sm:hidden text-sm">
                <div><span className="font-semibold">หมายเลขการเช่า:</span> {booking.renting_id.slice(0, 15)+"..."}</div>
                <div><span className="font-semibold">ID รถ:</span>
                  <Link 
                    href={`/car/${booking.car_id}`} 
                    className="text-blue-600 underline hover:text-blue-800 transition"
                  >
                    {booking.car_id.slice(0, 15) + "..."}
                  </Link>
                </div>
                <div><span className="font-semibold">ผู้เช่า:</span> {booking.lessee_name}</div>
                <div><span className="font-semibold">วันที่เช่า:</span> {formatDate(booking.sdate)} - {formatDate(booking.edate)}</div>
                <div>
                  <span className="font-semibold">สถานะ:</span>{" "}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {getStatusDisplay(booking.status)}
                  </span>
                </div>
                <div className="font-bold text-right mt-1">
                  {formatCurrency(booking.total_price ?? 0)}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block text-sm font-medium">{booking.renting_id.slice(0, 8)+"..."}</div>
              <div className="hidden sm:block text-sm">
                <Link 
                  href={`/car/${booking.car_id}`} 
                  className="text-blue-600 underline hover:text-blue-800 transition"
                >
                  {booking.car_id.slice(0, 8) + "..."}
                </Link>
              </div>
              <div className="hidden sm:block text-sm">{booking.lessee_name}</div>
              <div className="hidden sm:block text-sm col-span-2">
                {formatDate(booking.sdate)} - {formatDate(booking.edate)}
              </div>
              <div className="hidden sm:flex items-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {getStatusDisplay(booking.status)}
                </span>
              </div>
              <div className="hidden sm:block text-sm font-bold text-right">
                {formatCurrency(booking.total_price ?? 0)}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {totalCount === 0 && (
            <div className="p-12 text-center text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>ยังไม่มีประวัติการให้เช่าสำหรับรถของคุณ</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-8 flex justify-center">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  </main>
);

}




