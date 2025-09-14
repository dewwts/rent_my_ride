"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

// Top-right viewport
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // มุมขวาบน + ซ้อนเรียงลงมา
      "fixed top-5 right-5 z-[100] flex w-full max-w-[420px] flex-col items-end gap-3 p-0",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// สไตล์หลักของ toast ตามรูปแบบที่ต้องการ
const toastVariants = cva(
  [
    "group relative pointer-events-auto w-full overflow-hidden rounded-xl",
    "border shadow-lg",
    // แอนิเมชัน
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
    "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-gray-900",
        destructive: "bg-red-50 border-red-200 text-red-800",
        success: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

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
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ToastPrimitives.Action;
const ToastClose = ToastPrimitives.Close;
const ToastTitle = ToastPrimitives.Title;
const ToastDescription = ToastPrimitives.Description;

// ให้ use-toast ใช้ type เหล่านี้ได้
type ToastActionElement = React.ReactElement<typeof ToastAction>;
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

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
};
