import DashboardSidebar from "@/components/dashboard-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#D4E0E6] flex flex-col">
            <Header />
            <div className="flex flex-row">
                <main className="flex-1 font-mitr font-light ">{children}</main>
            </div>
            <Footer noMargin/>
    </div>
  );
}