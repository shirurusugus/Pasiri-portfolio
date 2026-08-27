"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SmokeveilProps {
  children?: React.ReactNode;
  className?: string;
}

export function Smokeveil({ children, className }: SmokeveilProps) {
  return (
    <div className={cn("aura-bg", className)}>
      {/* Layer 1 - screen (dark) / multiply (light) */}
      <div className="aura-layer-1" aria-hidden="true" />

      {/* Layer 2 - screen (dark) / multiply (light) */}
      <div className="aura-layer-2" aria-hidden="true" />

      {/* Layer 3 - multiply */}
      <div className="aura-layer-3" aria-hidden="true" />

      {/* Layer 4 - overlay (dark) / multiply (light) */}
      <div className="aura-layer-4" aria-hidden="true" />

      {/* Your content lives here - sits ABOVE the absolute layers */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}

export default Smokeveil;
