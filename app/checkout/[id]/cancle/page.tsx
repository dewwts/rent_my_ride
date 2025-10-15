"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function CancelPage() {
    const router = useRouter()

    const handleGoHome = () => {
        router.push("/")
    }

    return (
        <div className="h-screen flex justify-center items-center w-full bg-slate-50 px-4">
            <div className="
                w-full max-w-md mx-auto my-auto 
                bg-white rounded-xl shadow-xl 
                p-8 md:p-12 
                flex flex-col items-center justify-center text-center
                gap-6 animate-scale-in"
            >
                <XCircle className="h-20 w-20 text-slate-900" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        การชำระเงินไม่สำเร็จ
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        เกิดข้อผิดพลาดบางอย่าง หรือรายการได้ถูกยกเลิก กรุณาลองใหม่อีกครั้ง
                    </p>
                </div>
                <Button variant="default" size="lg" onClick={handleGoHome} className="w-full">
                    กลับไปหน้าหลัก
                </Button>
            </div>
        </div>
    )
}