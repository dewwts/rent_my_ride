import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { AuthButton } from "./auth-button";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "./env-var-warning";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo.png"
                alt="RentMyRide Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            <Button variant="nav" size="nav" asChild>
              <Link href="/">หน้าหลัก</Link>
            </Button>
            <Button variant="nav" size="nav" asChild>
              <Link href="/cars">เลือกรถ</Link>
            </Button>
            <Button variant="nav" size="nav" asChild>
              <Link href="/about">เกี่ยวกับเรา</Link>
            </Button>
            <Button variant="nav" size="nav" asChild>
              <Link href="/contact">ติดต่อ</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Button variant="menu" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </div>
      </div>
    </header>
  );
}