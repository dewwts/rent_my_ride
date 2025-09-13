import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex w-full items-center justify-center bg-gray-50 p-4 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="shadow-lg rounded-[20px] border-2 border-[#C3C3C3]">
            <CardHeader>
              <CardTitle className="text-2xl text-center font-normal mt-2">
                ขอบคุณที่ลงทะเบียน !
              </CardTitle>
              <CardDescription className="text-center text-black font-light">
                ตรวจสอบอีเมลเพื่อยืนยัน
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-2 ">
              <p className="text-sm text-black font-light">
                คุณลงทะเบียนสำเร็จเเล้ว
              </p>
              <p className="text-sm text-black font-light">
                กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ
              </p>
            </CardContent>
            <div className="flex items-center justify-center mt-1 mb-5">
              <Link href="/auth/login">
                <Button className="w-32 rounded-[24px]">เข้าสู่ระบบ</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
      <Footer noMargin/>
    </div>
  );
}

