"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Edit3,
  PlusCircle,
  LayoutDashboard,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Trash2,
  RefreshCw,
  Eye,
  Globe,
} from "lucide-react";

interface AdminTarget {
  type: string;
  id?: string;
  title?: string;
  editUrl: string;
  previewUrl?: string;
  deleteUrl?: string;
  addUrl?: string;
}

export function AdminContextMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState<AdminTarget | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't intercept right clicks inside text inputs or textareas or rich editor
      const targetElement = e.target as HTMLElement;
      if (
        targetElement.closest("input, textarea, [contenteditable='true'], .ProseMirror")
      ) {
        return;
      }

      // Check if user clicked on an admin editable row/card
      const editableEl = targetElement.closest("[data-admin-id], [data-admin-edit-url], [data-editable-id]") as HTMLElement | null;

      let detected: AdminTarget | null = null;

      if (editableEl) {
        const type = editableEl.getAttribute("data-admin-editable-type") || editableEl.getAttribute("data-editable-type") || "Item";
        const id = editableEl.getAttribute("data-admin-id") || editableEl.getAttribute("data-editable-id") || "";
        const title = editableEl.getAttribute("data-admin-title") || editableEl.getAttribute("data-editable-title") || "Item";
        const editUrl = editableEl.getAttribute("data-admin-edit-url") || editableEl.getAttribute("data-edit-url") || `/admin/${type}s/${id}`;
        const previewUrl = editableEl.getAttribute("data-admin-preview-url") || "";
        const deleteUrl = editableEl.getAttribute("data-admin-delete-url") || (id ? `/api/admin/${type}s/${id}` : "");
        const addUrl = editableEl.getAttribute("data-admin-add-url") || `/admin/${type}s/new`;

        detected = { type, id, title, editUrl, previewUrl, deleteUrl, addUrl };
      } else {
        // Fallback: General Admin Context Menu based on current admin section
        detected = getAdminSectionTarget(pathname);
      }

      if (detected) {
        e.preventDefault();
        setTarget(detected);

        const menuWidth = 240;
        const menuHeight = 300;
        const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
        const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

        setPosition({ x: Math.max(10, x), y: Math.max(10, y) });
        setVisible(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisible(false);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", () => setVisible(false), { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", () => setVisible(false));
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname]);

  const handleCopyLink = () => {
    if (target?.previewUrl) {
      navigator.clipboard.writeText(`${window.location.origin}${target.previewUrl}`);
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setVisible(false);
    }, 1200);
  };

  const handleDelete = async () => {
    if (!target?.deleteUrl || !target?.title) return;
    if (!confirm(`Are you sure you want to delete "${target.title}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(target.deleteUrl, { method: "DELETE" });
      if (res.ok) {
        setVisible(false);
        router.refresh();
      } else {
        alert("Failed to delete item");
      }
    } catch {
      alert("Error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!visible || !target) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      className="fixed z-50 min-w-[230px] overflow-hidden rounded-xl border border-accent/30 bg-[#14120e]/95 p-1.5 text-foreground shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10"
    >
      {/* Header Tag */}
      <div className="flex items-center justify-between border-b border-border/60 px-2.5 py-1.5 mb-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] font-semibold text-accent uppercase tracking-wider font-mono">
            Admin Quick Actions
          </span>
        </div>
        <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-mono">
          CMS
        </span>
      </div>

      {/* Target Title preview if available */}
      {target.title && (
        <div className="px-2.5 py-1 text-[11px] font-medium text-foreground/80 truncate max-w-[210px] border-b border-border/40 mb-1">
          {target.title}
        </div>
      )}

      {/* Action Items */}
      <div className="space-y-0.5 text-xs">
        {/* Edit Action */}
        <button
          onClick={() => {
            setVisible(false);
            router.push(target.editUrl);
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
        >
          <Edit3 className="h-4 w-4 text-accent group-hover:text-accent-foreground" />
          <span className="flex-1 truncate">Edit {target.title ? `"${truncate(target.title, 16)}"` : target.type}</span>
        </button>

        {/* View Live / Preview */}
        {target.previewUrl && (
          <button
            onClick={() => {
              setVisible(false);
              window.open(target.previewUrl, "_blank");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
          >
            <Eye className="h-4 w-4 text-accent" />
            <span>View Live Page</span>
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </button>
        )}

        {/* Add New Item */}
        {target.addUrl && (
          <button
            onClick={() => {
              setVisible(false);
              router.push(target.addUrl!);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-accent" />
            <span>Create New {capitalize(target.type)}</span>
          </button>
        )}

        {/* Copy Link / ID */}
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-accent" />
              <span className="text-accent">Copied! ✓</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Direct Link</span>
            </>
          )}
        </button>

        {/* Delete Item (if item row clicked) */}
        {target.deleteUrl && (
          <button
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-destructive hover:bg-destructive/15 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Item"}</span>
          </button>
        )}

        <div className="my-1 border-t border-border/60" />

        {/* Refresh Table */}
        <button
          onClick={() => {
            setVisible(false);
            router.refresh();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-accent" />
          <span>Refresh Table</span>
        </button>

        {/* View Public Website */}
        <button
          onClick={() => {
            setVisible(false);
            window.open("/", "_blank");
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
        >
          <Globe className="h-4 w-4 text-accent" />
          <span>Go to Live Website</span>
        </button>
      </div>
    </div>
  );
}

function truncate(str: string, max: number) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAdminSectionTarget(pathname: string): AdminTarget {
  if (pathname.includes("/admin/activities")) {
    return {
      type: "Activity",
      title: "Activities & Events List",
      editUrl: `/admin/activities`,
      addUrl: `/admin/activities/new`,
      previewUrl: `/activities`,
    };
  }

  if (pathname.includes("/admin/projects")) {
    return {
      type: "Project",
      title: "Projects Showcase List",
      editUrl: `/admin/projects`,
      addUrl: `/admin/projects/new`,
      previewUrl: `/projects`,
    };
  }

  if (pathname.includes("/admin/digital-art")) {
    return {
      type: "Artwork",
      title: "Digital Art Collection",
      editUrl: `/admin/digital-art`,
      addUrl: `/admin/digital-art/new`,
      previewUrl: `/digital-art`,
    };
  }

  if (pathname.includes("/admin/blog")) {
    return {
      type: "Article",
      title: "Write-ups & Blog",
      editUrl: `/admin/blog`,
      addUrl: `/admin/blog/new`,
      previewUrl: `/write-ups`,
    };
  }

  if (pathname.includes("/admin/skills")) {
    return {
      type: "Skills",
      title: "Skills & Methodologies",
      editUrl: `/admin/skills`,
      previewUrl: `/skills`,
    };
  }

  if (pathname.includes("/admin/experience")) {
    return {
      type: "Experience",
      title: "Experience Timeline",
      editUrl: `/admin/experience`,
      previewUrl: `/experience`,
    };
  }

  if (pathname.includes("/admin/certifications")) {
    return {
      type: "Certifications",
      title: "Certificates & Awards",
      editUrl: `/admin/certifications`,
      previewUrl: `/certifications`,
    };
  }

  if (pathname.includes("/admin/profile")) {
    return {
      type: "Profile",
      title: "Profile & Personal Bio",
      editUrl: `/admin/profile`,
      previewUrl: `/about`,
    };
  }

  if (pathname.includes("/admin/navigation")) {
    return {
      type: "Navigation",
      title: "Header Navigation Items",
      editUrl: `/admin/navigation`,
      previewUrl: `/`,
    };
  }

  if (pathname.includes("/admin/homepage")) {
    return {
      type: "Homepage",
      title: "Homepage Sections Manager",
      editUrl: `/admin/homepage`,
      previewUrl: `/`,
    };
  }

  if (pathname.includes("/admin/appearance")) {
    return {
      type: "Appearance",
      title: "Appearance & Theme Settings",
      editUrl: `/admin/appearance`,
      previewUrl: `/`,
    };
  }

  if (pathname.includes("/admin/seo")) {
    return {
      type: "SEO",
      title: "SEO & Search Metadata",
      editUrl: `/admin/seo`,
      previewUrl: `/`,
    };
  }

  return {
    type: "Dashboard",
    title: "CMS Overview",
    editUrl: `/admin`,
    previewUrl: `/`,
  };
}
