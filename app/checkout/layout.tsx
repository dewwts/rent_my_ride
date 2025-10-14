import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FFFFFF] flex flex-col">
            <Header />
            <div className="flex flex-row">
                <main className="flex-1 font-mitr font-light ">{children}</main>
            </div>
            <Footer noMargin/>
    </div>
  );
}