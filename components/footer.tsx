import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

export function Footer({ noMargin = false }: { noMargin?: boolean }) {
  return (
    <footer className= {`${noMargin ? "" : "mt-16"} bg-black`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/logo/logo.png"
              alt="RentMyRide Logo"
              width={120}
              height={40}
              className="object-contain brightness-0 invert"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Button variant="ghost-dark" size="sm" asChild>
              <Link href="/">หน้าหลัก</Link>
            </Button>
            <Button variant="ghost-dark" size="sm" asChild>
              <Link href="/cars">เลือกรถ</Link>
            </Button>
            <Button variant="ghost-dark" size="sm" asChild>
              <Link href="/about">เกี่ยวกับเรา</Link>
            </Button>
            <Button variant="ghost-dark" size="sm" asChild>
              <Link href="/contact">ติดต่อเรา</Link>
            </Button>
          </nav>

          {/* Contact */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300 font-medium">
              +66 99 9193769
            </p>
            <p className="text-xs text-gray-500 mt-1">
              &copy; 2024 สงวนลิขสิทธิ์
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}