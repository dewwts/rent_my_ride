"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, History } from "lucide-react"; // เพิ่ม ChevronLeft, ChevronRight
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from '@/lib/utils' 
import { rentingHistory, rentingInfo,RentingStatus } from "@/types/rentingInterface";
import { getMyLeasingHistory,getRentingPrice } from "@/lib/rentingServices";
import CustomPagination from "@/components/customPagination"
import { getCarStatus } from "@/lib/carServices";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function RentingHistoryPage() { 
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<rentingHistory[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10; 
  const supabase = createClient();
  const router = useRouter()
  const fetchOwnerBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const {data, count} = await getMyLeasingHistory(supabase, currentPage, itemsPerPage);
      // console.log(rentings);
      const LeasingWithRenintPrice = await Promise.all(
        data.map(async (leasing) => {
          const lesseeName = Array.isArray(leasing.lessee_name)
            ? leasing.lessee_name[0]
            : leasing.lessee_name;
          let price = 0
          try {
            price = await getRentingPrice(supabase, leasing.renting_id);
          }catch(err){
            console.error("Failed to get Renting Price", price);
          }
          return {
            renting_id: leasing.renting_id,
            car_id: leasing.car_id,
            sdate: leasing.sdate,
            edate: leasing.edate,
            status: leasing.status,
            total_price: price, 
            lessee_name:lesseeName.u_firstname
          }
        })
      )
      setTotalCount(count ? count : 0);
      setBookings(LeasingWithRenintPrice);
    } catch (err) {
      console.log(err)
      setError('เกิดข้อผิดพลาดในการโหลดประวัติการให้เช่า');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, supabase]);

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
  const nextLink = async(cid:string)=>{
    try{
      const isAvailable = await getCarStatus(supabase, cid)
      console.log(isAvailable);
      if (isAvailable){
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
                  <button 
                    onClick={()=>nextLink(booking.car_id)} 
                    className="text-blue-600 underline hover:text-blue-800 transition"
                  >
                    {booking.car_id.slice(0, 15) + "..."}
                  </button>
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
                <button
                    onClick={()=>nextLink(booking.car_id)} 
                    className="text-blue-600 underline hover:text-blue-800 transition"
                  >
                    {booking.car_id.slice(0, 15) + "..."}
                  </button>
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




