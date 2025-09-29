"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Key, CarFront,History } from "lucide-react";
import { useEffect,useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRole } from "@/lib/authServices";
import { toast } from "./ui/use-toast";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [role,setRole] = useState<"user" | "admin" | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async() => {
      try{
        const role = await getRole(supabase)
        if(role){
          setRole(role as "user" | "admin")
        }
      }catch(error){
        console.log(error);
        let err = "Something went wrong"
        if (error instanceof Error){
          err = error.message
          
        }else{
          err = "An error occurred"
        }
        toast({
          variant:"destructive",
          title:"ไม่สำเร็จ",
          description:err
        })
        console.log("โหลดroleไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [supabase]);
  if (loading || role === null) {
  return (
    <aside className="w-max bg-white border-r p-4 md:w-[300px]">
      {/* เว้นว่างไว้ให้ skeleton หรือเปล่า ๆ */}
    </aside>
  );
}

  const userMenu = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/profile", label: "โปรไฟล์ของฉัน", icon: <User size={18} /> },
    { href: "/dashboard/bookings", label: "การจองรถ", icon: <CarFront size={18} /> },
    { href: "/dashboard/cars", label: "ปล่อยเช่ารถ", icon: <Key size={18} /> }
  ];

  const adminMenu = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/profile", label: "โปรไฟล์ของฉัน", icon: <User size={18} /> },
    { href: "/dashboard/history", label: "ดูคำสั่งซื้อทั้งหมด", icon: <History size={18} /> }
  ];

  const menuItems = role === "admin" ? adminMenu : userMenu;
  return (
    <aside className="w-max bg-white border-r p-4 md:w-[300px]">
      <h2 className="font-mitr font-light text-[16px] text-[#8C8C8C] ml-3 mt-3 mb-3 hidden md:block">เกี่ยวกับรถ</h2>
      <nav className="flex flex-col gap-3 font-mitr font-light text-[15px] md:ml-3 mt-5">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#2B09F7] transition ${
              pathname === item.href ? " text-[#2B09F7] bg-[#D9D9D9]" : "text-[#8C8C8C]"
            }`}
          >
            {item.icon}
            <span className="ml-2 hidden md:block">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
