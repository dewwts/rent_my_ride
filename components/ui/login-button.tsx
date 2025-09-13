import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white rounded-xl hover:bg-gray-800 shadow-sm",
        destructive:
          "bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-sm",
        outline:
          "border border-gray-300 bg-white text-black rounded-xl hover:bg-gray-50 shadow-sm",
        secondary:
          "bg-gray-100 text-black rounded-xl hover:bg-gray-200 shadow-sm",
        ghost: 
          "text-gray-600 hover:text-black rounded-lg",
        link: 
          "text-black underline-offset-4 hover:underline p-0 h-auto",
        nav:
          "text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg font-medium text-sm",
        menu:
          "p-2 hover:bg-gray-50 rounded-lg",
        "ghost-dark":
          "text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg font-medium text-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        nav: "h-8 px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const LogInButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
LogInButton.displayName = "LogInButton";

export { LogInButton, buttonVariants };
