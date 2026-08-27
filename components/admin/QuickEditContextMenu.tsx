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
  Settings,
  Image as ImageIcon,
  BookOpen,
  FolderKanban,
  Award,
  Layers,
  User,
  Eye,
  LogIn,
} from "lucide-react";

interface EditableTarget {
  type: string; // "activity", "project", "artwork", "blog", "skill", "experience", "profile", "page"
  id?: string;
  title?: string;
  editUrl: string;
  addUrl?: string;
  slug?: string;
}

export function QuickEditContextMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState<EditableTarget | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check auth session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.authenticated))
      .catch(() => setIsAdmin(false));
  }, []);

  // Global Context Menu listener
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't intercept right clicks inside text inputs or textareas or rich editor
      const targetElement = e.target as HTMLElement;
      if (
        targetElement.closest("input, textarea, [contenteditable='true'], .ProseMirror")
      ) {
        return;
      }

      // Check if user clicked on an editable element
      const editableEl = targetElement.closest("[data-edit-url], [data-editable-type], [data-editable-id]") as HTMLElement | null;

      let detectedTarget: EditableTarget | null = null;

      if (editableEl) {
        const type = editableEl.getAttribute("data-editable-type") || "item";
        const id = editableEl.getAttribute("data-editable-id") || "";
        const title = editableEl.getAttribute("data-editable-title") || "Item";
        const editUrl = editableEl.getAttribute("data-edit-url") || (id ? `/admin/${type}s/${id}` : "/admin");
        const addUrl = editableEl.getAttribute("data-add-url") || `/admin/${type}s/new`;
        const slug = editableEl.getAttribute("data-editable-slug") || "";

        detectedTarget = { type, id, title, editUrl, addUrl, slug };
      } else {
        // Fallback to detecting from current pathname
        detectedTarget = getPageEditTarget(pathname);
      }

      if (detectedTarget) {
        e.preventDefault();
        setTarget(detectedTarget);

        // Adjust position so menu stays inside viewport
        const menuWidth = 240;
        const menuHeight = 280;
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
      // Quick edit hotkey: Ctrl+E / Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        const current = getPageEditTarget(pathname);
        if (current?.editUrl) {
          router.push(current.editUrl);
        }
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
  }, [pathname, router]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setVisible(false);
    }, 1200);
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
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="text-[11px] font-semibold text-accent uppercase tracking-wider font-mono">
            Quick Edit Actions
          </span>
        </div>
        {isAdmin && (
          <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-mono">
            ADMIN
          </span>
        )}
      </div>

      {/* Target Title preview if available */}
      {target.title && (
        <div className="px-2.5 py-1 text-[11px] font-medium text-foreground/75 truncate max-w-[210px] border-b border-border/40 mb-1">
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
          <div className="flex-1 truncate">
            <span>Edit {target.title ? `"${truncate(target.title, 18)}"` : target.type}</span>
          </div>
          <span className="text-[10px] opacity-60 font-mono">Ctrl+E</span>
        </button>

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

        <div className="my-1 border-t border-border/60" />

        {/* Go to CMS Dashboard */}
        <button
          onClick={() => {
            setVisible(false);
            router.push("/admin");
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="h-4 w-4 text-accent" />
          <span>Open CMS Dashboard</span>
        </button>

        {/* Copy Page Link */}
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-muted-foreground hover:bg-surface-secondary hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-accent" />
              <span className="text-accent">Copied Link! ✓</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* If not logged in, show Login link */}
        {isAdmin === false && (
          <>
            <div className="my-1 border-t border-border/60" />
            <button
              onClick={() => {
                setVisible(false);
                router.push("/admin/login");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-accent hover:bg-accent/15 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Login to Edit as Admin</span>
            </button>
          </>
        )}
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

function getPageEditTarget(pathname: string): EditableTarget {
  if (pathname.startsWith("/activities/")) {
    const slug = pathname.split("/activities/")[1];
    return {
      type: "Activity",
      title: "Current Activity",
      editUrl: `/admin/activities`,
      addUrl: `/admin/activities/new`,
      slug,
    };
  }

  if (pathname === "/activities") {
    return {
      type: "Activities Directory",
      title: "Activities & Events",
      editUrl: `/admin/activities`,
      addUrl: `/admin/activities/new`,
    };
  }

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/projects/")[1];
    return {
      type: "Project",
      title: "Current Project Case Study",
      editUrl: `/admin/projects`,
      addUrl: `/admin/projects/new`,
      slug,
    };
  }

  if (pathname === "/projects") {
    return {
      type: "Projects Showcase",
      title: "Projects",
      editUrl: `/admin/projects`,
      addUrl: `/admin/projects/new`,
    };
  }

  if (pathname.startsWith("/digital-art/")) {
    const slug = pathname.split("/digital-art/")[1];
    return {
      type: "Digital Artwork",
      title: "Current Artwork",
      editUrl: `/admin/digital-art`,
      addUrl: `/admin/digital-art/new`,
      slug,
    };
  }

  if (pathname === "/digital-art") {
    return {
      type: "Digital Art Collection",
      title: "Digital Art & Painting",
      editUrl: `/admin/digital-art`,
      addUrl: `/admin/digital-art/new`,
    };
  }

  if (pathname.startsWith("/write-ups/")) {
    const slug = pathname.split("/write-ups/")[1];
    return {
      type: "Article",
      title: "Current Write-up",
      editUrl: `/admin/blog`,
      addUrl: `/admin/blog/new`,
      slug,
    };
  }

  if (pathname === "/write-ups") {
    return {
      type: "Write-ups & Research",
      title: "Write-ups",
      editUrl: `/admin/blog`,
      addUrl: `/admin/blog/new`,
    };
  }

  if (pathname === "/resume") {
    return {
      type: "Resume",
      title: "Resume & CV",
      editUrl: `/admin/profile`,
    };
  }

  if (pathname === "/skills") {
    return {
      type: "Skills",
      title: "Skills & Capabilities",
      editUrl: `/admin/skills`,
    };
  }

  if (pathname === "/experience") {
    return {
      type: "Experience",
      title: "Experience Timeline",
      editUrl: `/admin/experience`,
    };
  }

  if (pathname === "/certifications") {
    return {
      type: "Certifications",
      title: "Certifications & Awards",
      editUrl: `/admin/certifications`,
    };
  }

  if (pathname === "/about") {
    return {
      type: "Profile Bio",
      title: "About & Profile",
      editUrl: `/admin/profile`,
    };
  }

  // Home page default
  return {
    type: "Website",
    title: "Homepage Layout",
    editUrl: `/admin/website/homepage`,
    addUrl: `/admin/projects/new`,
  };
}
