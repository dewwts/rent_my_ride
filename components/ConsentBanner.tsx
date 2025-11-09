"use client";

import { usePathname } from "next/navigation";
import React from "react";

export type ConsentState = "Undefined" | "Accepted" | "Unaccepted";

const STORAGE_KEY = "isaccept";

function readConsent(): ConsentState {
  if (typeof window === "undefined") return "Undefined";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "Accepted" || v === "Unaccepted") return v;
  return "Undefined";
}

function writeConsent(state: Exclude<ConsentState, "Undefined">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, state);
}

export function useConsent() {
  const [consent, setConsent] = React.useState<ConsentState>("Undefined");

  React.useEffect(() => {
    setConsent(readConsent());
  }, []);

  const accept = React.useCallback(() => {
    writeConsent("Accepted");
    setConsent("Accepted");
  }, []);

  const reject = React.useCallback(() => {
    writeConsent("Unaccepted");
    setConsent("Unaccepted");
  }, []);

  return { consent, accept, reject } as const;
}

export default function ConsentBanner(props: {
  privacyHref?: string;
  termsHref?: string;
  onAccept?: () => void;
  onReject?: () => void;
  portalTargetId?: string;
}) {
  const { privacyHref = "/", termsHref = "/", onAccept, onReject } = props;
  const [open, setOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsClient(true);
    const current = readConsent();
    setOpen(current === "Undefined" || current === "Unaccepted");
  }, []);

  React.useEffect(() => {
    if (readConsent() === "Undefined" || readConsent() === "Unaccepted") {
      setOpen(true);
    }
  }, [pathname]);

  const handleAccept = () => {
    writeConsent("Accepted");
    setOpen(false);
    onAccept?.();
  };

  const handleReject = () => {
    writeConsent("Unaccepted");
    setOpen(false);
    onReject?.();
  };

  if (!isClient || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-auto"
      onClick={() => setOpen(false)} 
    >
      {/* พื้นหลังมืดครึ้ม */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" aria-hidden="true" />

      {/* กล่อง consent มุมขวาล่าง */}
      <div
        className="absolute bottom-6 right-6 w-full max-w-[420px] sm:max-w-[400px] text-black pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-title"
          className="relative rounded-2xl bg-[#FAFAFA] text-black shadow-xl ring-1 ring-black/30 p-6"
        >
          <h2 id="cookie-title" className="text-lg font-bold mb-2">
            เว็บไซต์นี้ใช้คุกกี้ !
          </h2>

          <p className="text-sm leading-relaxed">
            เราใช้คุกกี้เพื่อการวิเคราะห์และเพื่อปรับปรุงประสบการณ์การใช้งานของคุณ โดยการกด ‘ยอมรับ’ ถือว่าคุณยินยอมให้เราใช้คุกกี้เหล่านี้ คุณสามารถจัดการการตั้งค่าของคุณได้ในภายหลัง หรือ ตรวจสอบข้อมูลเพิ่มเติมได้ที่นโยบายคุกกี้ของเรา
          </p>

          <div className="mt-4 flex gap-2 flex-col sm:flex-row">
            <button
              onClick={handleAccept}
              className="inline-flex flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-[#000000] text-[#FAFAFA] hover:bg-[#111111] focus:outline-none focus:ring-2 focus:ring-black/40"
            >
              ยอมรับทั้งหมด
            </button>

            <button
              onClick={handleReject}
              className="inline-flex flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-[#000000] text-[#FAFAFA] hover:bg-[#111111] focus:outline-none focus:ring-2 focus:ring-black/40"
            >
              ปฏิเสธทั้งหมด
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#000000]">
            <a href={privacyHref} className="underline underline-offset-4 hover:text-[#000000]">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href={termsHref} className="underline underline-offset-4 hover:text-[#000000]">
              ข้อกำหนดและเงื่อนไขการใช้งาน
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}