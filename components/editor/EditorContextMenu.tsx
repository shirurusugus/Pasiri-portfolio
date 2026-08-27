"use client";

import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  RemoveFormatting,
} from "lucide-react";

interface EditorContextMenuProps {
  editor: Editor | null;
  onOpenMediaModal: () => void;
  onInsertTimeline: () => void;
  onSetLink: () => void;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function EditorContextMenu({
  editor,
  onOpenMediaModal,
  onInsertTimeline,
  onSetLink,
}: EditorContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Check if click was inside editor
      const target = e.target as HTMLElement;
      const editorElement = editor.view.dom;

      if (editorElement.contains(target) || target.closest(".ProseMirror")) {
        e.preventDefault();

        // Calculate clamped position
        const menuWidth = 260;
        const menuHeight = 360;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let posX = e.clientX + 5;
        let posY = e.clientY + 5;

        if (posX + menuWidth > windowWidth) {
          posX = windowWidth - menuWidth - 15;
        }
        if (posY + menuHeight > windowHeight) {
          posY = windowHeight - menuHeight - 15;
        }

        setPosition({ x: posX, y: posY });
        setIsOpen(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  if (!isOpen || !editor) return null;

  const runCommand = (command: () => void) => {
    command();
    setIsOpen(false);
  };

  return (
    <div
      ref={menuRef}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      className="fixed z-[99999] w-64 select-none rounded-xl border border-border/80 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 font-sans text-xs text-foreground"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-border/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5 text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Text & Block Actions</span>
        </span>
        <span className="text-[10px] font-mono opacity-60">Right-Click</span>
      </div>

      {/* Quick Formatting Icons Strip */}
      <div className="flex items-center justify-between gap-1 border-b border-border/40 p-1">
        <button
          type="button"
          onClick={() => runCommand(() => editor.chain().focus().toggleBold().run())}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            editor.isActive("bold")
              ? "bg-accent text-accent-foreground font-bold"
              : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => runCommand(() => editor.chain().focus().toggleItalic().run())}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            editor.isActive("italic")
              ? "bg-accent text-accent-foreground font-bold"
              : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => runCommand(() => editor.chain().focus().toggleStrike().run())}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            editor.isActive("strike")
              ? "bg-accent text-accent-foreground font-bold"
              : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => runCommand(() => editor.chain().focus().toggleHighlight().run())}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            editor.isActive("highlight")
              ? "bg-amber-400 text-black font-bold"
              : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
          }`}
          title="Highlight Text"
        >
          <Highlighter className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => runCommand(() => onSetLink())}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
            editor.isActive("link")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
          }`}
          title="Insert Link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            )
          }
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-surface-secondary hover:text-destructive transition-colors"
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Headings & Text Type */}
      <div className="py-1 border-b border-border/40 space-y-0.5">
        <button
          type="button"
          onClick={() =>
            runCommand(() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            )
          }
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-accent/20 text-accent font-semibold"
              : "hover:bg-surface-secondary text-foreground/90"
          }`}
        >
          <span className="flex items-center gap-2">
            <Heading2 className="h-3.5 w-3.5 text-accent" />
            <span>หัวข้อหลัก (Heading 2)</span>
          </span>
          <span className="font-mono text-[10px] opacity-40">##</span>
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            )
          }
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-accent/20 text-accent font-semibold"
              : "hover:bg-surface-secondary text-foreground/90"
          }`}
        >
          <span className="flex items-center gap-2">
            <Heading3 className="h-3.5 w-3.5 text-accent" />
            <span>หัวข้อย่อย (Heading 3)</span>
          </span>
          <span className="font-mono text-[10px] opacity-40">###</span>
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() => editor.chain().focus().setParagraph().run())
          }
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
            editor.isActive("paragraph")
              ? "bg-accent/10 text-foreground font-medium"
              : "hover:bg-surface-secondary text-foreground/90"
          }`}
        >
          <span className="flex items-center gap-2">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <span>ข้อความธรรมดา (Paragraph)</span>
          </span>
        </button>
      </div>

      {/* Alignment */}
      <div className="py-1 border-b border-border/40 grid grid-cols-3 gap-1 px-1">
        <button
          type="button"
          onClick={() =>
            runCommand(() => editor.chain().focus().setTextAlign("left").run())
          }
          className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-accent text-accent-foreground font-semibold"
              : "hover:bg-surface-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlignLeft className="h-3 w-3" />
          <span>ซ้าย</span>
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() =>
              editor.chain().focus().setTextAlign("center").run()
            )
          }
          className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-accent text-accent-foreground font-semibold"
              : "hover:bg-surface-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlignCenter className="h-3 w-3" />
          <span>กลาง</span>
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() => editor.chain().focus().setTextAlign("right").run())
          }
          className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-accent text-accent-foreground font-semibold"
              : "hover:bg-surface-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlignRight className="h-3 w-3" />
          <span>ขวา</span>
        </button>
      </div>

      {/* Lists & Quotes */}
      <div className="py-1 border-b border-border/40 space-y-0.5">
        <button
          type="button"
          onClick={() =>
            runCommand(() => editor.chain().focus().toggleBulletList().run())
          }
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
            editor.isActive("bulletList")
              ? "bg-accent/20 text-accent font-semibold"
              : "hover:bg-surface-secondary text-foreground/90"
          }`}
        >
          <List className="h-3.5 w-3.5 text-muted-foreground" />
          <span>รายการสัญลักษณ์ (Bullet List)</span>
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() => editor.chain().focus().toggleOrderedList().run())
          }
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
            editor.isActive("orderedList")
              ? "bg-accent/20 text-accent font-semibold"
              : "hover:bg-surface-secondary text-foreground/90"
          }`}
        >
          <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
          <span>ลำดับตัวเลข (Numbered List)</span>
        </button>

        <button
          type="button"
          onClick={() =>
            runCommand(() => editor.chain().focus().toggleBlockquote().run())
          }
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
            editor.isActive("blockquote")
              ? "bg-accent/20 text-accent font-semibold"
              : "hover:bg-surface-secondary text-foreground/90"
          }`}
        >
          <Quote className="h-3.5 w-3.5 text-muted-foreground" />
          <span>กล่องคำคม (Quote Block)</span>
        </button>
      </div>

      {/* High-Value Insertions */}
      <div className="pt-1 space-y-1">
        <button
          type="button"
          onClick={() => runCommand(() => onInsertTimeline())}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>✨ แทรก Timeline ณ จุดนี้</span>
        </button>

        <button
          type="button"
          onClick={() => runCommand(() => onOpenMediaModal())}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
        >
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>🖼️ แทรกรูปภาพ (Upload Image)</span>
        </button>
      </div>
    </div>
  );
}
