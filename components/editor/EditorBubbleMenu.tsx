"use client";

import React from "react";
import { BubbleMenu, Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Sparkles,
  RemoveFormatting,
} from "lucide-react";

interface EditorBubbleMenuProps {
  editor: Editor | null;
  onSetLink: () => void;
  onInsertTimeline: () => void;
}

export function EditorBubbleMenu({
  editor,
  onSetLink,
  onInsertTimeline,
}: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top" }}
      shouldShow={({ editor, view, state, from, to }) => {
        // Only show if text is selected
        return from !== to && !editor.isActive("image");
      }}
      className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface/95 p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
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
        onClick={() => editor.chain().focus().toggleItalic().run()}
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
        onClick={() => editor.chain().focus().toggleStrike().run()}
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
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive("highlight")
            ? "bg-amber-400 text-black font-bold"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Highlight"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-border mx-0.5" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`flex h-7 px-1.5 items-center justify-center rounded text-xs gap-1 transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-accent/20 text-accent font-semibold"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`flex h-7 px-1.5 items-center justify-center rounded text-xs gap-1 transition-colors ${
          editor.isActive("heading", { level: 3 })
            ? "bg-accent/20 text-accent font-semibold"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-border mx-0.5" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive({ textAlign: "left" })
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Align Left"
      >
        <AlignLeft className="h-3 w-3" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive({ textAlign: "center" })
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Align Center"
      >
        <AlignCenter className="h-3 w-3" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive({ textAlign: "right" })
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Align Right"
      >
        <AlignRight className="h-3 w-3" />
      </button>

      <div className="h-4 w-px bg-border mx-0.5" />

      <button
        type="button"
        onClick={onSetLink}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          editor.isActive("link")
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-surface-secondary hover:text-foreground"
        }`}
        title="Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-surface-secondary hover:text-destructive transition-colors"
        title="Clear Format"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </button>
    </BubbleMenu>
  );
}
