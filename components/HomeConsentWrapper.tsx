"use client";

import { useEffect } from "react";
import ConsentBanner, { useConsent } from "@/components/ConsentBanner";

export default function HomeConsentWrapper() {
  const { consent } = useConsent();

  useEffect(() => {

    if (consent === "Undefined" || consent === "Unaccepted") {
      try {
        localStorage.removeItem("supabase.auth.token");
        sessionStorage.clear();
        document.cookie =
          "sb:token=; Max-Age=0; path=/; SameSite=Lax; Secure;";
      } catch (err) {
        console.error("Error clearing token:", err);
      }
    }
  }, [consent]);

  return (
    <ConsentBanner
      privacyHref="/"
      termsHref="/"
      onAccept={() => console.log("Cookies accepted")}
      onReject={() => {
        try {
          localStorage.removeItem("supabase.auth.token");
          sessionStorage.clear();
          document.cookie =
            "sb:token=; Max-Age=0; path=/; SameSite=Lax; Secure;";
        } catch (err) {
          console.error("Error clearing token:", err);
        }
      }}
    />
  );
}
