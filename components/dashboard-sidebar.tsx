"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Key, CarFront, History, ChevronDown, ChevronUp, LucideIcon } from "lucide-react"; 
import { useEffect,useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRole } from "@/lib/authServices";
import { toast } from "./ui/use-toast";
import { StandardMenuItem, DropdownMenuItemType, MenuItem } from "@/types/dashboard"; 

const DropdownMenuItemComponent = ({ 
  item, 
  pathname, 
  defaultSubPath 
}: { 
  item: DropdownMenuItemType; 
  pathname: string; 
  defaultSubPath: string 
}) => {
  const isActive = item.subItems.some((sub) => pathname.startsWith(sub.href)) || pathname.startsWith(defaultSubPath);

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive]);

  return (
    <div className="flex flex-col">
      {/* ส่วนหัวของ Dropdown: ปล่อยเช่ารถ */}
      <Link
        href={defaultSubPath} 
        onClick={(e) => {
          e.preventDefault(); 
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#2B09F7] transition ${
          isActive ? " text-[#2B09F7] bg-[#D9D9D9]" : "text-[#8C8C8C]"
        }`}
      >
        {item.icon}
        <span className="ml-2 hidden md:block">{item.label}</span>
        {/* ไอคอนแสดงสถานะเปิด/ปิด */}
        {isOpen ? <ChevronUp size={16} className="ml-auto hidden md:block" /> : <ChevronDown size={16} className="ml-auto hidden md:block" />}
      </Link>

      {/* รายการเมนูย่อย */}
      {isOpen && (
        <div className="flex flex-col gap-1 mt-1 pl-8">
          {item.subItems.map((sub: StandardMenuItem) => ( 
            <Link
              key={sub.href}
              href={sub.href}
              className={`flex items-center px-3 py-2 rounded-lg hover:text-[#2B09F7] transition text-[14px] ${
                pathname.startsWith(sub.href) 
                  ? " text-[#2B09F7] bg-[#D9D9D9]" 
                  : "text-[#8C8C8C]"
              }`}
            >
              <span className="ml-2 hidden md:block">{sub.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


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
      {/* ... (skeleton) ... */}
    </aside>
  );
}

  // **กำหนด Type ให้กับ userMenu**
  const userMenu: MenuItem[] = [ 
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard size={18} />, isDropdown: false },
    { href: "/dashboard/profile", label: "โปรไฟล์ของฉัน", icon: <User size={18} />, isDropdown: false },
    { href: "/dashboard/bookings", label: "การจองรถ", icon: <CarFront size={18} />, isDropdown: false },
    { 
      label: "ปล่อยเช่ารถ", 
      icon: <Key size={18} />,
      isDropdown: true, 
      subItems: [
        { href: "/dashboard/cars", label: "รถของฉัน", icon: <CarFront size={18} /> },
        { href: "/dashboard/rentings", label: "ประวัติการเช่า", icon: <History size={18} /> }
      ]
    }
  ];

  // **กำหนด Type ให้กับ adminMenu**
  const adminMenu: StandardMenuItem[] = [ // Type StandardMenuItem ถูก Import มาใช้
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard size={18} /> },
    { href: "/dashboard/profile", label: "โปรไฟล์ของฉัน", icon: <User size={18} /> },
    { href: "/dashboard/history", label: "ดูคำสั่งซื้อทั้งหมด", icon: <History size={18} /> }
  ];

  // **กำหนด Type ให้กับ menuItems**
  const menuItems: MenuItem[] = role === "admin" ? adminMenu : userMenu;
  
  return (
    <aside className="w-max bg-white border-r p-4 md:w-[300px]">
      <h2 className="font-mitr font-light text-[16px] text-[#8C8C8C] ml-3 mt-3 mb-3 hidden md:block">เกี่ยวกับรถ</h2>
      <nav className="flex flex-col gap-3 font-mitr font-light text-[15px] md:ml-3 mt-5">
        {menuItems.map((item) => {
          if (item.isDropdown) {
            const defaultSubPath = item.subItems[0].href; 
            return (
              <DropdownMenuItemComponent 
                key={item.label} 
                item={item} 
                pathname={pathname} 
                defaultSubPath={defaultSubPath} 
              />
            );
          }
          
          // **โค้ดนี้จะทำงานเมื่อ item.isDropdown เป็น false เท่านั้น**
          return (
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
          );
        })}
      </nav>
    </aside>
  );
}