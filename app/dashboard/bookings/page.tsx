"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, History } from "lucide-react"; // เพิ่ม ChevronLeft, ChevronRight
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from '@/lib/utils' 
import { bookingHistory, rentingInfo,RentingStatus } from "@/types/rentingInterface";
import { getMyRentingHistory,getRentingPrice } from "@/lib/rentingServices";
import { getFirstname } from "@/lib/userServices";
import CustomPagination from "@/components/customPagination"
import { Button } from "@/components/ui/button";
import { getCarStatus } from "@/lib/carServices";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function RentingHistoryPage() { 
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<bookingHistory[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10; 
  const supabase = createClient();
  const router =useRouter()
  const fetchOwnerBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyRentingHistory(supabase);

      // ทำ pagination อย่างไงวะเนี่ย สุดท้ายก็คือ fetch หมดอยู่ดี
      const bookingsWithPriceandLessorName = await Promise.all(
        data.map(async (booking) => {
          // error อยู่ยังไม่ได้แก้ by phaolap
          const carInfo = Array.isArray(booking.car_information) 
              ? booking.car_information[0]
              : booking.car_information; 

          if (!carInfo || !carInfo.owner_id) {
               console.error("ไม่พบ owner_id ใน car_information:", booking.renting_id);
               return { ...booking, total_price: 0, lessor_name: "ไม่พบเจ้าของ" }; 
          }
          const ownerId = carInfo.owner_id;
          const lessor_name = await getFirstname(supabase,ownerId);
          try {
            const price = await getRentingPrice(supabase, booking.renting_id);
            if(price == null){
              return null;
            }
            return { ...booking, total_price: price ?? 0 ,lessor_name}; //add total price field
          } catch (err) {
            console.error("Error fetching price for", booking.renting_id, err);
            return { ...booking, total_price: 0, lessor_name }; // fallback
          }
        })
      );

      const filterNullPrice = bookingsWithPriceandLessorName.filter(
        (item): item is NonNullable<typeof item> => item !== null
      );

      setTotalCount(filterNullPrice.length);
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = filterNullPrice.slice(start, end);

      setBookings(pageData);
      
    } catch (err) {
      console.error('Error fetching mock bookings:', err);
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการเช่า');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, supabase]);

  useEffect(() => {
    fetchOwnerBookings(); 
  }, [currentPage, fetchOwnerBookings, supabase]);
  
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
  const nextLink = async(cid:string)=>{
    try{
      const isAvailable = await getCarStatus(supabase, cid)
      console.log(isAvailable);
      if (isAvailable === 'available'){
        router.push(`/car/${cid}`)
      }else{
        toast({
          variant:"destructive",
          title:"ไม่สำเร็จ",
          description: "รถนี้ไม่ได้อณุญาตให้เข้าถึงได้อีกต่อไป"
        })
      }
    }catch(err:unknown){
      let message = "Something went wrong"
      if (err instanceof Error){
        message = err.message
      }
      toast({
        variant:"destructive",
        title:"ไม่สำเร็จ",
        description:message
      })
    }
  }
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center sm:text-left">
        ประวัติการเช่าทั้งหมด
      </h2>

      {/* พื้นหลังขาว */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
        
{/* Header: แสดงเฉพาะในหน้าจอขนาด sm ขึ้นไป */}
<div className="hidden sm:grid grid-cols-[1fr_auto] gap-3 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
  <div className="grid grid-cols-7 gap-4">
    <div>หมายเลขการเช่า</div>
    <div>ID รถ</div>
    <div>ผู้ให้เช่า</div>
    <div className="col-span-2">วันที่เช่า</div>
    <div>สถานะ</div>
    <div className="text-right">ราคา</div>
  </div>
  <div className="w-[120px]"></div> {/* Spacer for review button column */}
</div>

{/* Table Body / Card List */}
<div className="space-y-3 mt-2">
  {bookings.map((booking) => (
    <div key={booking.renting_id}>
      {/* Main booking card with review button wrapper */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Grey booking info card */}
        <div className="flex-1 rounded-lg bg-[#F0F0F0] text-gray-800 transition hover:bg-[#E5E7F9] border border-gray-300 p-4 sm:p-3 sm:grid sm:grid-cols-7 sm:gap-4">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-1 sm:hidden text-sm">
            <div><span className="font-semibold">หมายเลขการเช่า:</span> {booking.renting_id.slice(0, 15)+"..."}</div>
            <div><span className="font-semibold">ID รถ:</span>
              <Button
                onClick={()=>nextLink(booking.car_id)} 
                className="text-blue-600 underline hover:text-blue-800 transition"
              >
                {booking.car_id.slice(0, 15) + "..."}
              </Button>
            </div>
            <div><span className="font-semibold">ผู้ให้เช่า:</span> {booking.lessor_name}</div>
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
            <button
              onClick={()=>nextLink(booking.car_id)} 
              className="text-blue-600 underline hover:text-blue-800 transition"
            >
              {booking.car_id.slice(0, 15) + "..."}
            </button>
          </div>
          <div className="hidden sm:block text-sm">{booking.lessor_name}</div>
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

        {/* Green Review Button - Outside grey block, on the right */}
        {booking.status === RentingStatus.CONFIRMED && (
          <button
            onClick={() => nextLink(booking.car_id)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap sm:w-[120px] sm:self-center"
          >
            <span>รีวิวการเช่า</span>
          </button>
        )}
        {/* Empty space when no review button to maintain alignment */}
        {booking.status !== RentingStatus.CONFIRMED && (
          <div className="hidden sm:block sm:w-[120px]"></div>
        )}
      </div>
    </div>
  ))}

          {/* Empty State */}
          {totalCount === 0 && (
            <div className="p-12 text-center text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>ยังไม่มีประวัติการเช่า</p>
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




