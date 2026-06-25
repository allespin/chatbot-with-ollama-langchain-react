import React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/40",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
