import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Schließen"
    className={cn(
      "inline-flex h-11 w-11 items-center justify-center rounded-full",
      "bg-primary text-primary-foreground shadow-sm",
      "hover:bg-primary/90 active:scale-95 transition",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <X className="h-4 w-4" strokeWidth={2.5} />
    <span className="sr-only">Schließen</span>
  </button>
));
CloseButton.displayName = "CloseButton";
