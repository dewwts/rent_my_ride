import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { AuthButton } from "./auth-button";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "./env-var-warning";

export function Header() {
  return (
    <header className="w-full h-[128px] bg-black text-white border-b border-gray-800">
      <div className="max-w-[1680px] h-full flex justify-between items-center px-6 mx-auto">
        
        {/* Logo Text */}
        <Link href="/" className="flex items-center">
          <span
            className="font-[ZCOOL_XiaoWei] text-[40px] font-normal leading-[100%] tracking-normal"
            style={{
              fontFamily: "ZCOOL XiaoWei, serif",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "40px",
              lineHeight: "100%",
              letterSpacing: "0%",
              width: "300px",
              height: "40px",
              opacity: 1,
            }}
          >
            RENT MY RIDE
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="hidden lg:flex items-center justify-center"
          style={{
            width: "517px",
            height: "38px",
            gap: "62px",
            opacity: 1,
          }}
        >
          {[
            { href: "/", label: "หน้าหลัก" },
            { href: "/cars", label: "เลือกรถ" },
            { href: "/about", label: "เกี่ยวกับเรา" },
            { href: "/contact", label: "ติดต่อ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="uppercase text-center"
              style={{
                fontFamily: "Mitr",
                fontWeight: 300,
                fontStyle: "normal",
                fontSize: "24px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth & Mobile Menu */}
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <button className="text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
      </div>
    </header>
  );
}
