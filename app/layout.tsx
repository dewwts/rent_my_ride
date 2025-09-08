import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

// ✅ เพิ่ม Toaster เข้ามา
import { Toaster } from "@/components/ui/toaster";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "RentMyRide - Car Rental Platform",
  description: "Find and rent the perfect car for your next adventure",
};

const prompt = Prompt({
  variable: "--font-prompt",
  display: "swap",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${prompt.className} antialiased bg-white text-black`}>
        {children}
        {/* ✅ Toaster ตำแหน่ง global แสดง toast ทุกหน้าของแอป */}
        <Toaster />
      </body>
    </html>
  );
}
