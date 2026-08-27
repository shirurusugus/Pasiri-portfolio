"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Calendar,
  FileText,
  Briefcase,
  Award,
  Sparkles,
  User,
  Image as ImageIcon,
  Home,
  Menu as MenuIcon,
  Palette,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AdminContextMenu } from "@/components/admin/AdminContextMenu";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // If on login page, render children directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navGroups: {
    group: string;
    items: {
      label: string;
      href: string;
      icon: any;
      exact?: boolean;
    }[];
  }[] = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      group: "Portfolio Content",
      items: [
        { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
        { label: "Activities", href: "/admin/activities", icon: Calendar },
        { label: "Digital Art", href: "/admin/digital-art", icon: Sparkles },
        { label: "Write-ups", href: "/admin/blog", icon: BookOpen },
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
      ],
    },
    {
      group: "Profile & Resume",
      items: [
        { label: "Bio & Identity", href: "/admin/profile", icon: User },
        { label: "Experience", href: "/admin/experience", icon: Briefcase },
        { label: "Skills", href: "/admin/skills", icon: Palette },
        { label: "Certificates", href: "/admin/certifications", icon: Award },
      ],
    },
    {
      group: "Site Architecture",
      items: [
        { label: "Navigation", href: "/admin/navigation", icon: Globe },
        { label: "Homepage Sections", href: "/admin/homepage", icon: Home },
        { label: "Appearance", href: "/admin/appearance", icon: Palette },
        { label: "SEO & Metadata", href: "/admin/seo", icon: Globe },
      ],
    },
    {
      group: "Configuration",
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const isLinkActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ---------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* ---------------------------------------------------- */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-surface transition-all duration-300 sticky top-0 h-screen z-30",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header / Brand */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3.5">
          <BrandLogo
            size="sm"
            showText={!collapsed}
            suffix="CMS"
            href="/admin"
            className="overflow-hidden"
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {grp.group}
                </div>
              )}
              <div className="space-y-0.5">
                {grp.items.map((item) => {
                  const active = isLinkActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-accent/15 text-accent font-semibold"
                          : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "View Live Site" : undefined}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View Live Site</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Log Out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              Control Management System
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-xs border-border">
              <Link href="/" target="_blank">
                <span>View Site</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative flex w-4/5 max-w-xs flex-col bg-surface p-4 shadow-2xl border-r border-border">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="font-semibold text-sm">pasiri CMS</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {navGroups.map((grp, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {grp.group}
                    </span>
                    <div className="space-y-1">
                      {grp.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium",
                            isLinkActive(item.href, item.exact)
                              ? "bg-accent/20 text-accent font-semibold"
                              : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mt-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AdminContextMenu />
    </div>
  );
}
