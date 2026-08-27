"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { CommandMenu } from "./CommandMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BrandLogo } from "@/components/ui/BrandLogo";

interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

interface HeaderProps {
  navItems?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "1", label: "Home", href: "/" },
  { id: "2", label: "Resume", href: "/resume" },
  { id: "3", label: "Activities & Events", href: "/activities" },
  { id: "4", label: "Digital Art", href: "/digital-art" },
  { id: "5", label: "Awards & Certificates", href: "/certifications" },
  { id: "6", label: "Write-ups", href: "/write-ups" },
  { id: "7", label: "Contact", href: "/contact" },
];

export function Header({ navItems = DEFAULT_NAV_ITEMS }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Identity */}
        <BrandLogo size="md" href="/" />

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-1.5"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return item.isExternal ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {item.label}
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active
                    ? "bg-surface-secondary text-foreground font-semibold border border-border/40 shadow-xs"
                    : "text-muted-foreground hover:bg-surface-secondary/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Search + Theme + Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <CommandMenu />
          <ThemeToggle />

          {/* Mobile Menu Toggle (44x44 target area) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 min-h-[44px] min-w-[44px] md:hidden text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return item.isExternal ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-[44px] items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active
                      ? "bg-surface-secondary text-foreground font-semibold border-l-2 border-accent pl-2.5"
                      : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
