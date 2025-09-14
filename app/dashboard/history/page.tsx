"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Loader2,
  ArrowLeft,
  Calendar,
  DollarSign,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Pagination from "@/components/ui/Pagination";

interface Transaction {
  transaction_id: string;
  renting_id: string;
  lessee_id: string;
  lessor_id: string;
  amount: number;
  status: "Pending" | "Done" | "Failed";
  date: string;
  renting: {
    sdate: string;
    edate: string;
    status: string;
    car_information: {
      car_brand: string;
      model: string;
      year_created: number;
      car_image: string;
    };
  };
  lessee_info: {
    u_firstname: string;
    u_lastname: string;
  };
  lessor_info: {
    u_firstname: string;
    u_lastname: string;
  };
}

export default function TransactionHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, done, failed
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  // NEW: search states
  const [searchType, setSearchType] = useState<"transaction" | "user">(
    "transaction"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    done: 0,
    failed: 0,
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkRoleAndFetchTransactions();
  }, [router, supabase, currentPage, filter, itemsPerPage]);

  const checkRoleAndFetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check admin role first
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      // Fetch user_info to check role
      const { data: userInfo, error: roleError } = await supabase
        .from("user_info")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userInfo || userInfo.role !== "admin") {
        router.push("/auth/login");
        return;
      }

      // If admin role confirmed, fetch all transactions
      await fetchAllTransactions();
    } catch (err) {
      console.error("Error checking role:", err);
      setError("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์การเข้าใช้งาน");
      setLoading(false);
    }
  };
  // NEW: แปลงข้อความเพื่อเทียบแบบไม่สนตัวพิมพ์
  const normalize = (s?: string) => (s ?? "").toLowerCase().trim();

  // NEW: สร้างรายการที่จะนำมาแสดงหลังกรองด้วย search
  const displayedTransactions = transactions.filter((t) => {
    const q = normalize(searchTerm);
    if (!q) return true; // ไม่พิมพ์คำค้น = แสดงทั้งหมดของหน้าปัจจุบัน

    if (searchType === "transaction") {
      return normalize(t.transaction_id).includes(q);
    } else {
      // user mode: ค้นหาจาก lessee_id หรือ lessor_id
      return (
        normalize(t.lessee_id).includes(q) || normalize(t.lessor_id).includes(q)
      );
    }
  });

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all status counts
      const [
        allCountResult,
        pendingCountResult,
        doneCountResult,
        failedCountResult,
      ] = await Promise.all([
        supabase
          .from("transactions")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending"),
        supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("status", "Done"),
        supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("status", "Failed"),
      ]);

      // Update status counts
      setStatusCounts({
        all: allCountResult.count || 0,
        pending: pendingCountResult.count || 0,
        done: doneCountResult.count || 0,
        failed: failedCountResult.count || 0,
      });

      // Get filtered count for pagination
      let countQuery = supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      // Apply status filter if not 'all'
      if (filter !== "all") {
        countQuery = countQuery.eq(
          "status",
          filter.charAt(0).toUpperCase() + filter.slice(1)
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error counting transactions:", countError);
        setError("เกิดข้อผิดพลาดในการนับจำนวนธุรกรรม");
        return;
      }

      setTotalCount(count || 0);

      // Fetch paginated transactions
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage - 1;

      let dataQuery = supabase.from("transactions").select(`
          transaction_id,
          renting_id,
          lessee_id,
          lessor_id,
          amount,
          status,
          date,
          renting:renting_id (
            sdate,
            edate,
            status,
            car_information:car_id (
              car_brand,
              model,
              year_created,
              car_image
            )
          ),
          lessee_info:lessee_id (
            u_firstname,
            u_lastname
          ),
          lessor_info:lessor_id (
            u_firstname,
            u_lastname
          )
        `);

      if (filter !== "all") {
        dataQuery = dataQuery.eq(
          "status",
          filter.charAt(0).toUpperCase() + filter.slice(1)
        );
      }

      const { data, error: fetchError } = await dataQuery
        .order("date", { ascending: false })
        .range(startIndex, endIndex);

      if (fetchError) {
        console.error("Error fetching transactions:", fetchError);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลธุรกรรม");
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error("Error:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} วัน`;
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString("th-TH")}`;
  };

  const getStatusBadge = (status: string) => {
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
      case "Failed":
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

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-yellow-400";
      case "Done":
        return "border-green-500";
      case "Failed":
        return "border-red-500";
      default:
        return "border-gray-200";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) {
    return (
      <main
        className="min-h-screen grid place-items-center"
        style={{ backgroundColor: "#c9d1d9" }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            กำลังตรวจสอบสิทธิ์และโหลดข้อมูลธุรกรรม...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#c9d1d9" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => checkRoleAndFetchTransactions()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#c9d1d9" }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              จัดการธุรกรรมทั้งหมด (Admin)
            </h1>
            <p className="text-gray-600 mt-1">ดูข้อมูลธุรกรรมทั้งหมดในระบบ</p>
          </div>

          {/* Filter Tabs */}
          {/* NEW: Search controls */}
          <div className="bg-white/70 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Toggle search type */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchType("transaction_id")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    searchType === "transaction_id"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ค้นหาด้วย Transaction ID
                </button>
                <button
                  onClick={() => setSearchType("user_id")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    searchType === "user_id"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ค้นหาด้วย Lessee/Lessor ID
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-[420px]">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // ไม่ไปรีเฟรชหรือยิงซ้ำ Supabase — กรองบน client เท่านั้น
                  }}
                  placeholder={
                    searchType === "transaction"
                      ? "พิมพ์รหัสธุรกรรม (เช่น 1a2b3c)"
                      : "พิมพ์ Lessee/Lessor ID"
                  }
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* hint เล็ก ๆ */}
            {searchTerm && (
              <p className="mt-2 text-xs text-gray-500">
                โหมดค้นหา:{" "}
                <span className="font-medium">
                  {searchType === "transaction"
                    ? "รหัสธุรกรรม"
                    : "Lessee/Lessor ID"}
                </span>{" "}
                • คำค้น: <span className="font-mono">{searchTerm}</span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {[
                { key: "all", label: "ทั้งหมด", count: statusCounts.all },
                {
                  key: "pending",
                  label: "รอดำเนินการ",
                  count: statusCounts.pending,
                },
                { key: "done", label: "เสร็จสิ้น", count: statusCounts.done },
                { key: "failed", label: "ล้มเหลว", count: statusCounts.failed },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
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

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">แสดงต่อหน้า:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 รายการ</option>
                <option value={10}>10 รายการ</option>
                <option value={20}>20 รายการ</option>
                <option value={50}>50 รายการ</option>
              </select>
            </div>
          </div>

          {/* Note about admin data */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              🔒 <strong>หมายเหตุ:</strong> นี่เป็นหน้า Admin
              ที่แสดงธุรกรรมทั้งหมดในระบบจากฐานข้อมูล Supabase
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Transaction Cards */}
        <div className="space-y-6">
          {displayedTransactions.map((transaction) => (
            <div
              key={transaction.transaction_id}
              className={`bg-white rounded-xl shadow-sm border-2 ${getStatusBorderColor(
                transaction.status
              )} overflow-hidden hover:shadow-md transition-shadow`}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        รหัสธุรกรรม: {transaction.transaction_id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        วันที่ทำรายการ: {formatDate(transaction.date)}
                      </p>
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
                    <h4 className="font-medium text-gray-900 mb-3">
                      ข้อมูลรถยนต์
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={
                            transaction.renting?.car_information?.car_image ||
                            "https://via.placeholder.com/300x200?text=No+Image"
                          }
                          alt={`${transaction.renting?.car_information?.car_brand} ${transaction.renting?.car_information?.model}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.renting?.car_information?.car_brand ||
                            "ไม่มีข้อมูล"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.renting?.car_information?.model}{" "}
                          {transaction.renting?.car_information?.year_created}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-gray-900 mb-3">
                      รายละเอียดการเช่า
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(transaction.renting?.sdate || "")} -{" "}
                          {formatDate(transaction.renting?.edate || "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center text-xs text-gray-400">
                          📅
                        </span>
                        <span className="text-sm text-gray-600">
                          ระยะเวลา:{" "}
                          {calculateDuration(
                            transaction.renting?.sdate || "",
                            transaction.renting?.edate || ""
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* People Involved */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-lg text-gray-900 mb-3">
                      ผู้เกี่ยวข้อง
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">ผู้เช่า</p>
                        <div className="inline-flex items-center px-3 py-2 bg-gray-900 text-white rounded-full">
                          <span className="text-base font-medium">
                            {transaction.lessee_info?.u_firstname}{" "}
                            {transaction.lessee_info?.u_lastname}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">ผู้ให้เช่า</p>
                        <div className="inline-flex items-center px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-full">
                          <span className="text-base font-medium">
                            {transaction.lessor_info?.u_firstname}{" "}
                            {transaction.lessor_info?.u_lastname}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              showInfo={true}
            />
          </div>
        )}
        {/* NEW: Search empty state (เฉพาะตอนมีรายการในหน้า แต่คำค้นไม่ตรงอะไรเลย) */}
        {transactions.length > 0 && displayedTransactions.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่พบรายการที่ตรงกับคำค้น
            </h3>
            <p className="text-gray-600">
              {searchType === "transaction"
                ? "ลองตรวจสอบรหัสธุรกรรมหรือเว้นว่างเพื่อดูทั้งหมด"
                : "ลองตรวจสอบ Lessee/Lessor ID หรือเว้นว่างเพื่อดูทั้งหมด"}
            </p>
          </div>
        )}

        {/* Empty State */}
        {totalCount === 0 && !loading && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ไม่มีธุรกรรมในหมวดหมู่นี้
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "ยังไม่มีธุรกรรมในระบบ"
                : `ไม่มีรายการที่มีสถานะ "${
                    filter === "pending"
                      ? "รอดำเนินการ"
                      : filter === "done"
                      ? "เสร็จสิ้น"
                      : filter === "failed"
                      ? "ล้มเหลว"
                      : filter
                  }"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
