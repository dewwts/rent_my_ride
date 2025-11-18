"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent || consent === "declined") {
      // Show consent dialog after component mounts
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <>
      {/* Label in top-left corner */}
      <div className="fixed top-4 left-4 z-[9999] flex items-center gap-1.5 text-gray-400 text-xs">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-400"
        >
          <path
            d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
            fill="currentColor"
          />
        </svg>
        <span>Cookies Consent</span>
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/50 z-[9998]" />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-purple-200 shadow-xl max-w-md w-full p-6 space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-black">
            เว็บไซต์เรามี Cookies <span className="font-bold">Cookies</span>
          </h2>

          {/* Body Text */}
          <p className="text-black text-sm leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, your consent to our use of cookies.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {/* Decline Button */}
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 border-blue-600 text-blue-600 bg-white hover:bg-gray-50 rounded-lg h-11"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>ปฏิเสธ</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>

            {/* Accept All Button */}
            <Button
              onClick={handleAccept}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg h-11"
            >
              <ChevronRight className="w-4 h-4" />
              <span>ยอมรับทั้งหมด</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

