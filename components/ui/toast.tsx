"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

// Top-center viewport
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // กลางบน + เว้น top-4 + กว้างไม่เกิน 420
      "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex w-full max-w-[420px] flex-col items-center gap-2 p-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// สไตล์หลักของ toast — ใส่ glass + gradient + shadow หนา + border โปร่ง
const toastVariants = cva(
  [
    "group relative pointer-events-auto w-full overflow-hidden rounded-2xl",
    "border border-white/15 bg-white/10 backdrop-blur-md",
    "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]",
    // gradient overlay ด้านบน (ไฮไลต์หรู ๆ)
    "before:absolute before:inset-0 before:-z-10 before:rounded-2xl",
    "before:bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.35),rgba(255,255,255,0)_60%)]",
    // แอนิเมชัน (ต้องมี tailwindcss-animate)
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
    "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          // ขอบไล่เฉด + แถบไล่เฉดด้านซ้ายบาง ๆ ให้มีมิติ
          "bg-gradient-to-br from-white/15 to-white/5 " +
          "after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-gradient-to-b after:from-indigo-400/80 after:via-fuchsia-400/70 after:to-pink-400/60 after:opacity-80",
        destructive:
          "border-red-300/30 bg-red-50/10 text-red-900/90 " +
          "after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-gradient-to-b after:from-red-500 after:via-rose-500 after:to-orange-400",
        success:
          "border-emerald-300/30 bg-emerald-50/10 text-emerald-900/90 " +
          "after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-gradient-to-b after:from-emerald-400 after:via-teal-400 after:to-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = ToastPrimitives.Action
const ToastClose = ToastPrimitives.Close
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description

// ให้ use-toast ใช้ type เหล่านี้ได้
type ToastActionElement = React.ReactElement<typeof ToastAction>
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastActionElement,
  type ToastProps,
}
