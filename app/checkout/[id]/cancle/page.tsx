"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CanclePage(){
    const router = useRouter()
    const handleGoHome = ()=>{
        router.push("/")
    }
    return (
        <div className="h-screen flex justify-center items-center w-full px-5 py-2">
            <div className="mx-auto my-auto rounded-2xl px-20 py-5 border-2 drop-shadow-lg flex items-center justify-between flex-col
            bg-red-200 bg-opacity-50 gap-20 w-4/12">
                <h1 className="text-center font-bold text-2xl text-red-500">ชำระเงินไม่สำเร็จ</h1>
                <p className="text-center font-semibold text-sm">โปรดติดต่อแอดมิน</p>
                <Button variant="default" size="sm" onClick={handleGoHome}>กลับไปหน้าหลัก</Button>
            </div>
        </div>
    )
}