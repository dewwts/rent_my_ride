// app/auth/sign-up/page.tsx
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SignUpForm } from "@/components/sign-up-form"; // <-- ต้องมีไฟล์นี้และ export ตรงชื่อ

export default function Page() {
  // NOTE: นี่คือ React Component (Server Component) ที่คืน JSX ชัดเจน
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
