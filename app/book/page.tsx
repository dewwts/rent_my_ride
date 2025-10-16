import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";

export default function BookingSubmissionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold mb-2">ชื่อของ Title รถ</h1>
          <div className="inline-block bg-[#003D5B] text-white px-6 py-2 rounded-full shadow-sm">
            xx บาท
            </div>
        </div>

        {/* Car Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* รูปรถ */}
          <div className="rounded-2xl overflow-hidden border">
            <div className="relative w-full aspect-[16/10] bg-gray-50">
              <Image
                src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=500&fit=crop"
                alt="Car preview"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* รายละเอียดรถ */}
          <div>
            <h2 className="text-2xl font-bold mb-3">ข้อมูลรถ</h2>
            <p className="text-gray-600 leading-relaxed">
              รถยนต์อเนกประสงค์ขนาด 7 ที่นั่ง พร้อมเครื่องยนต์ดีเซลและระบบขับเคลื่อน 4 ล้อ
            </p>
          </div>
        </div>

        {/* Date picker section */}
        <form
          action="/checkout"
          method="GET"
          className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4 border-t border-gray-200"
        >
          <input
            type="date"
            name="sdate"
            required
            className="border rounded-xl px-4 py-2 w-56"
          />
          <input
            type="date"
            name="edate"
            required
            className="border rounded-xl px-4 py-2 w-56"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-6 py-2 font-medium transition"
          >
            เช่ารถคันนี้
          </button>
        </form>

        <div className="text-right text-gray-500 text-sm">
          ระบบจะพาคุณไปหน้า Checkout เพื่อยืนยันการชำระเงิน
        </div>

        {/* กลับไปเลือกรถ */}
        <div className="text-center pt-10">
          <Link
            href="/cars"
            className="text-slate-700 hover:underline text-sm font-medium"
          >
            ← กลับไปหน้าเลือกรถ
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
