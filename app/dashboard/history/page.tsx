"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Adjust path as needed
import { Check, X, Loader2, ArrowLeft, Calendar, DollarSign } from "lucide-react";
import axios from 'axios'

export default function TransactionHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, done, failed
  const router = useRouter();
  const supabase = createClient();
  const [page,setPage] = useState<Number>(1);
   useEffect(() => {
    const checkRole = async () => {
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/auth/login");
        return;
      }

      // Fetch user_info
      const { data, error: roleError } = await supabase
        .from("user_info")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !data || data.role !== "admin") {
        router.push("/auth/login");
        return;
      }

      setLoading(false);
      const response = await axios.get(`/api/transaction/${page}`);
      console.log(response.data);
      
    };

    checkRole();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <p className="text-gray-600">กำลังตรวจสอบสิทธิ์เข้าใช้งาน…</p>
      </main>
    );
  }

  // Mock transaction data - In real implementation, this would come from backend
  const mockTransactions = [
    {
      id: 1,
      carImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
      carName: "Toyota Camry",
      carModel: "2023 Hybrid",
      rentalDuration: "3 วัน",
      startDate: "15 ก.ค. 2024",
      endDate: "18 ก.ค. 2024",
      totalCost: "฿4,500",
      status: "Done",
      lesseName: "สมชาย ใจดี",
      lessorName: "บริษัทเช่ารถ ABC",
      transactionDate: "12 ก.ค. 2024",
      bookingId: "BK001234"
    },
    {
      id: 2,
      carImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&h=300&fit=crop",
      carName: "Honda CR-V",
      carModel: "2024 AWD",
      rentalDuration: "7 วัน",
      startDate: "20 ก.ค. 2024",
      endDate: "27 ก.ค. 2024",
      totalCost: "฿12,600",
      status: "Pending",
      lesseName: "สมหญิง รักสะอาด",
      lessorName: "เช่ารถดี Limited",
      transactionDate: "18 ก.ค. 2024",
      bookingId: "BK001235"
    },
    {
      id: 3,
      carImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop",
      carName: "Mazda CX-5",
      carModel: "2024 Premium",
      rentalDuration: "5 วัน",
      startDate: "10 ก.ค. 2024",
      endDate: "15 ก.ค. 2024",
      totalCost: "฿14,000",
      status: "Fail",
      lesseName: "อนุชา สุขใส",
      lessorName: "Premium Car Rental",
      transactionDate: "8 ก.ค. 2024",
      bookingId: "BK001236"
    }
  ];

  const getStatusBadge = (status:string) => {
    switch (status) {
      case "Pending":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">รอดำเนินการ</span>
          </div>
        );
      case "Done":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">เสร็จสิ้น</span>
          </div>
        );
      case "Fail":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full">
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">ล้มเหลว</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBorderColor = (status:string) => {
    switch (status) {
      case "Pending": return "border-yellow-400";
      case "Done": return "border-green-500";
      case "Fail": return "border-red-500";
      default: return "border-gray-200";
    }
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.status.toLowerCase() === filter;
  });


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#c9d1d9' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">ประวัติธุรกรรม</h1>
            <p className="text-gray-600 mt-1">ดูประวัติการทำธุรกรรมเช่ารถทั้งหมดของคุณ</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "all", label: "ทั้งหมด", count: mockTransactions.length },
              { key: "pending", label: "รอดำเนินการ", count: mockTransactions.filter(t => t.status === "Pending").length },
              { key: "done", label: "เสร็จสิ้น", count: mockTransactions.filter(t => t.status === "Done").length },
              { key: "fail", label: "ล้มเหลว", count: mockTransactions.filter(t => t.status === "Fail").length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === tab.key 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Note about dynamic data */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>หมายเหตุ:</strong> ข้อมูลจะแสดงตามจำนวนธุรกรรมจริงจาก Backend (อาจเป็น 0 หรือมากกว่า 3 รายการ)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Transaction Cards */}
        <div className="space-y-6">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className={`bg-white rounded-xl shadow-sm border-2 ${getStatusBorderColor(transaction.status)} overflow-hidden hover:shadow-md transition-shadow`}>
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">รหัสจอง: {transaction.bookingId}</h3>
                      <p className="text-sm text-gray-600">วันที่ทำรายการ: {transaction.transactionDate}</p>
                    </div>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Car Information */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-gray-900 mb-3">ข้อมูลรถยนต์</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={transaction.carImage}
                          alt={`${transaction.carName} ${transaction.carModel}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{transaction.carName}</p>
                        <p className="text-sm text-gray-600">{transaction.carModel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-gray-900 mb-3">รายละเอียดการเช่า</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {transaction.startDate} - {transaction.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center text-xs text-gray-400">📅</span>
                        <span className="text-sm text-gray-600">ระยะเวลา: {transaction.rentalDuration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-bold text-gray-900">{transaction.totalCost}</span>
                      </div>
                    </div>
                  </div>

                  {/* People Involved */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-lg text-gray-900 mb-3">ผู้เกี่ยวข้อง</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">ผู้เช่า</p>
                        <div className="inline-flex items-center px-3 py-2 bg-gray-900 text-white rounded-full">
                          <span className="text-base font-medium">{transaction.lesseName}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">ผู้ให้เช่า</p>
                        <div className="inline-flex items-center px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-full">
                          <span className="text-base font-medium">{transaction.lessorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีธุรกรรมในหมวดหมู่นี้</h3>
            <p className="text-gray-600">
              {filter === "all" ? "คุณยังไม่มีประวัติธุรกรรม" : `ไม่มีรายการที่มีสถานะ "${
                filter === "pending" ? "รอดำเนินการ" :
                filter === "done" ? "เสร็จสิ้น" : "ล้มเหลว"
              }"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}