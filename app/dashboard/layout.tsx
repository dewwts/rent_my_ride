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
                <DashboardSidebar />
                <main className="flex-1">{children}</main>
            </div>
            <Footer />
    </div>
  );
}