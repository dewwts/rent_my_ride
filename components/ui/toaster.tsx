"use client"

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastClose,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="up">
      {toasts.map(function ({ id, title, description, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="relative grid w-full grid-cols-[1fr_auto] items-start gap-2 p-4 pr-10">
              <div className="space-y-1">
                {title && (
                  <ToastTitle className={cn(
                    "text-[15px] font-semibold tracking-tight",
                    variant === "destructive"
                      ? "text-red-900/90"
                      : variant === "success"
                      ? "text-emerald-900/90"
                      : "text-slate-900/90"
                  )}>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-sm/relaxed text-slate-700/90">
                    {description}
                  </ToastDescription>
                )}
              </div>

              {/* ปุ่มปิด มุมขวาบน */}
              <ToastClose
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full
                           bg-white/40 text-slate-700 backdrop-blur hover:bg-white/70 focus:outline-none
                           ring-1 ring-black/10 transition"
                aria-label="Close"
              >
                ✕
              </ToastClose>
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
