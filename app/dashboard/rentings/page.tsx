"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, History, ChevronLeft, ChevronRight } from "lucide-react"; // เพิ่ม ChevronLeft, ChevronRight
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from '@/lib/utils' 
import { rentingInfo,RentingStatus } from "@/types/rentingInterface";
import { getRentings,getRentingPrice } from "@/lib/rentingServices";

export const createMockBookings = (count: number): rentingInfo[] => {
  const mockData: rentingInfo[] = [];
  const statuses = [RentingStatus.CONFIRMED, RentingStatus.PENDING] as const;

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const startDay = (i % 28) + 1;
    const endDay = startDay + 3;

    mockData.push({
      renting_id: `RENT-${1000 + i}`,
      car_id: `CAR-${200 + i}`,
      lessee_id: `USER-${3000 + i}`,
      sdate: `2025-09-${startDay.toString().padStart(2, "0")}`,
      edate: `2025-09-${endDay.toString().padStart(2, "0")}`,
      status,
      total_price: 3500 + (i % 5) * 1000,
    });
  }

  return mockData;
};


// **คอมโพเนนต์สำหรับ Pagination ที่กำหนดเอง**
const CustomPagination = ({ currentPage, totalPages, onPageChange }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
}) => {
    const pagesToShow = 5; 
    
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > pagesToShow) {
        startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
        endPage = Math.min(totalPages, startPage + pagesToShow - 1);

        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - pagesToShow + 1);
        }
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

    return (
        <div className="flex items-center space-x-2 text-sm font-mitr">
            {/* ปุ่ม ก่อนหน้า */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isPrevDisabled}
                className={`px-3 py-2 rounded-lg transition ${
                    isPrevDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                } flex items-center`}
            >
                <ChevronLeft size={16} />
                <span className="ml-1">ก่อนหน้า</span>
            </button>

            {/* หมายเลขหน้า */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`h-9 w-9 rounded-lg transition font-medium ${
                        page === currentPage 
                            ? "bg-gray-900 text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {page}
                </button>
            ))}
            
            {/* ปุ่ม ถัดไป */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isNextDisabled}
                className={`px-3 py-2 rounded-lg transition ${
                    isNextDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                } flex items-center`}
            >
                <span className="mr-1">ถัดไป</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
};


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
      
      const data = await getRentings(supabase);
      // const data = createMockBookings(68)
      setTotalCount(data.length);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = data.slice(start, end);

      const bookingsWithPrice = await Promise.all(
        pageData.map(async (booking) => {
          try {
            const price = await getRentingPrice(supabase, booking.renting_id);
            return { ...booking, total_price: price ?? 0 }; //add total price field
          } catch (err) {
            console.error("Error fetching price for", booking.renting_id, err);
            return { ...booking, total_price: 0 }; // fallback
          }
        })
      );

    setBookings(bookingsWithPrice);
      
    } catch (err) {
      console.error('Error fetching mock bookings:', err);
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการเช่า');
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
          <p className="text-gray-600">กำลังโหลดประวัติการเช่า...</p>
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
            <h2 className="text-3xl font-bold mb-6 text-gray-900">ประวัติการเช่าทั้งหมด</h2>
            
            {/* Content Area: ใช้พื้นหลังสีขาวเพื่อให้เน้น */}
            <div className="bg-white p-4 rounded-lg shadow-md"> 

                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 px-3 py-2 text-sm font-semibold text-gray-700">
                    <div className="col-span-1">หมายเลขการเช่า</div>
                    <div className="col-span-1">ID รถ</div>
                    <div className="col-span-1">ID ผู้เช่า</div>
                    <div className="col-span-2">วันที่เช่า</div>
                    <div className="col-span-1">สถานะ</div>
                    <div className="col-span-1 text-right">รายได้</div>
                </div>
                
                {/* Table Body */}
                <div className="space-y-3 mt-2">
                    {bookings.map((booking) => (
                        // **สไตล์แถวข้อมูล: ใช้สีฟ้าอ่อน/น้ำเงิน (#E5E7F9) และขอบมนตาม UI**
                        <div 
                            key={booking.renting_id} 
                            className="grid grid-cols-7 gap-4 px-3 py-3 rounded-lg bg-[#F0F0F0] text-gray-800 transition hover:bg-[#E5E7F9] border border-gray-300"
                        >
                            {/* หมายเลขการเช่า */}
                            <div className="col-span-1 text-sm font-medium">
                                {booking.renting_id.slice(0, 10)}
                            </div>
                            {/* ID รถ */}
                            <div className="col-span-1 text-sm">
                                {booking.car_id.slice(0, 10)}
                            </div>
                            {/* ID ผู้เช่า */}
                            <div className="col-span-1 text-sm">
                                {booking.lessee_id.slice(0, 10)}
                            </div>
                            {/* วันที่เช่า */}
                            <div className="col-span-2 text-sm">
                                {formatDate(booking.sdate)} - {formatDate(booking.edate)}
                            </div>
                            {/* สถานะ */}
                            <div className="col-span-1 text-sm font-medium">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                    {getStatusDisplay(booking.status)}
                                </span>
                            </div>
                            {/* รายได้ */}
                            <div className="col-span-1 text-sm font-bold text-right">
                                {formatCurrency(booking.total_price ?? 0)}
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {totalCount === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>ยังไม่มีประวัติการเช่าสำหรับรถของคุณ</p>
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





// **ฟังก์ชันสำหรับสร้างข้อมูล Mock**
// const createMockBookings = (page: number, limit: number, total: number): rentingInfo[] => {
//   const mockData: rentingInfo[] = [];
//   const start = (page - 1) * limit;
//   const end = Math.min(start + limit, total);
//   const statuses = ['Ready', 'Ongoing', 'Completed'] as const; 

//   for (let i = start; i < end; i++) {
//     const statusIndex = i % statuses.length;
//     mockData.push({
//       booking_id: `ORDER-D${1000 + i}`,
//       car_id: `CAR-D${200 + i}`,
//       renter_id: `USER-D${3000 + i}`,
//       start_date: `2025-09-${(i % 28) + 1}`,
//       end_date: `2025-09-${(i % 28) + 5}`,
//       status: statuses[statusIndex],
//       total_price: (i % 5) * 1500 + 3500, 
//       car_info: {
//         car_plate: `กข${(i % 10) + 1} ${8000 + i}`,
//         car_brand: i % 2 === 0 ? 'Toyota Yaris' : 'Honda City',
//       },
//       renter_info: {
//         u_firstname: `ผู้เช่า`,
//         u_lastname: `${(i % 10) + 1}`,
//       },
//     } as Booking);
//   }
//   return mockData;
// };

// const MOCK_TOTAL_COUNT = 68; 