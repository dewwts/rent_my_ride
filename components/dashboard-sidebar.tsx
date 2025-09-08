"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Key, CarFront } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/profile", label: "โปรไฟล์ของฉัน", icon: <User size={18} /> },
  { href: "/dashboard/bookings", label: "การจองรถ", icon: <CarFront size={18} /> },
  { href: "/dashboard/cars", label: "ปล่อยเช่ารถ", icon: <Key size={18} /> },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[350px] h-screen bg-white border-r p-4">
      <h2 className="font-mitr font-light text-[16px] text-[#8C8C8C] ml-3 mt-3 mb-3">เกี่ยวกับรถ</h2>
      <nav className="flex flex-col gap-3 font-mitr font-light text-[15px] ml-3 mt-5">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#2B09F7] transition ${
              pathname === item.href ? " text-[#2B09F7] bg-[#D9D9D9]" : "text-[#8C8C8C]"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
