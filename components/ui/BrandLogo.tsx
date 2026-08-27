"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  showText?: boolean;
  textClassName?: string;
  suffix?: string;
  className?: string;
  href?: string | null;
}

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56,
};

export function BrandLogo({
  size = "md",
  showText = true,
  textClassName,
  suffix,
  className,
  href = "/",
}: BrandLogoProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 32;

  const content = (
    <div className={cn("group inline-flex items-center gap-2 select-none", className)}>
      {/* Emblem Container with subtle hover animation */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Dark Theme Logo (Sky Blue P) */}
        <Image
          src="/logo-light.png"
          alt="PASIRI Logo"
          width={pixelSize}
          height={pixelSize}
          className="hidden dark:block object-contain drop-shadow-[0_0_10px_rgba(96,165,250,0.35)]"
          priority
        />
        {/* Light Theme Logo (Navy Blue P) */}
        <Image
          src="/logo-dark.png"
          alt="PASIRI Logo"
          width={pixelSize}
          height={pixelSize}
          className="block dark:hidden object-contain"
          priority
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-foreground transition-colors group-hover:text-accent">
          <span className={cn("text-base font-extrabold tracking-widest uppercase", textClassName)}>
            PASIRI
          </span>
          {suffix && (
            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent uppercase tracking-normal">
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
        aria-label="PASIRI Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandLogo;
