"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import YoutubeExtension from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Minus,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Sparkles,
  Check,
  Type,
  Trash2,
  Maximize2,
  Minimize2,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { ProcessTimelineEditor, ProcessTimelineData } from "./ProcessTimelineEditor";
import { ProcessTimelineNode } from "./ProcessTimelineNode";
import { EditorContextMenu } from "./EditorContextMenu";
import { EditorBubbleMenu } from "./EditorBubbleMenu";

interface RichTextEditorProps {
  content?: string;
  timelineData?: ProcessTimelineData | null;
  onChange?: (html: string, json: any) => void;
  onTimelineChange?: (data: ProcessTimelineData | null) => void;
  saveStatus?: "idle" | "saving" | "saved";
}

// Custom TipTap Image with Size and Alignment Attributes
const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("width") || element.style.width || "100%",
        renderHTML: (attributes) => {
          const width = attributes.width || "100%";
          const display = attributes.display || (width === "120px" || width === "140px" || width === "160px" ? "inline-block" : "block");
          const alignment = attributes.alignment || "center";

          let marginStyle = "margin-left: auto; margin-right: auto;";
          if (display === "inline-block") {
            marginStyle = "margin: 0.5rem; vertical-align: middle;";
          } else if (alignment === "left") {
            marginStyle = "margin-right: auto; margin-left: 0;";
          } else if (alignment === "right") {
            marginStyle = "margin-left: auto; margin-right: 0;";
          }

          return {
            width,
            "data-alignment": alignment,
            "data-display": display,
            style: `width: ${width}; max-width: 100%; height: auto; display: ${display}; ${marginStyle}`,
            class: "content-image",
          };
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment || "center",
        }),
      },
      display: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-display") || (element.style.display === "inline-block" ? "inline-block" : "block"),
        renderHTML: (attributes) => ({
          "data-display": attributes.display || "block",
        }),
      },
    };
  },
});

export function RichTextEditor({
  content = "",
  timelineData,
  onChange,
  onTimelineChange,
  saveStatus = "idle",
}: RichTextEditorProps) {
  const [showTimelineEditor, setShowTimelineEditor] = useState(!!timelineData);
  const [editorBoxPosition, setEditorBoxPosition] = useState<"top" | "bottom">("bottom");
  const [isContextMenuMediaOpen, setIsContextMenuMediaOpen] = useState(false);
  const [imageAttributes, setImageAttributes] = useState<{
    width?: string;
    alignment?: string;
    display?: string;
  } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline underline-offset-4 font-medium",
        },
      }),
      YoutubeExtension.configure({
        inline: false,
        width: 640,
        height: 360,
      }),
      Placeholder.configure({
        placeholder: "Write your article, design process narrative, or case study breakdown here...",
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ProcessTimelineNode,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose-editorial max-w-none min-h-[300px] p-4 sm:p-6 focus:outline-none text-foreground leading-relaxed text-sm sm:text-base",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive("image")) {
        const attrs = editor.getAttributes("image");
        setImageAttributes(attrs);
      } else {
        setImageAttributes(null);
      }
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML(), editor.getJSON());
      }
    },
  });

  // Keep editor content in sync when initial content is supplied or loaded
  useEffect(() => {
    if (editor && content) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== content && (currentHTML === "<p></p>" || currentHTML === "" || editor.isEmpty)) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  // Keep timeline visibility state in sync
  useEffect(() => {
    setShowTimelineEditor(!!timelineData);
  }, [timelineData]);

  const addImage = (url: string, alt?: string, width: string = "100%") => {
    if (editor && url) {
      const display = width === "120px" || width === "140px" || width === "160px" ? "inline-block" : "block";
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: alt || "", width, display } as any)
        .run();
    }
  };

  const updateSelectedImage = (attrs: { width?: string; alignment?: string; display?: string }) => {
    if (editor && editor.isActive("image")) {
      const current = editor.getAttributes("image");
      editor.chain().focus().updateAttributes("image", { ...current, ...attrs }).run();
      setImageAttributes((prev) => ({ ...prev, ...attrs }));
    }
  };

  const deleteSelectedImage = () => {
    if (editor && editor.isActive("image")) {
      editor.chain().focus().deleteSelection().run();
      setImageAttributes(null);
    }
  };

  const addYoutube = () => {
    const url = prompt("Enter YouTube Video URL:");
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleInsertTimelineMarker = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "processTimeline",
          attrs: {
            title: "Process & Milestones",
            subtitle: "Step-by-step methodological journey",
            steps: [
              {
                stepNumber: "01",
                title: "Empathize",
                description: "Interview & Observation",
                quote: "ลงพื้นที่พูดคุยเพื่อทำความเข้าใจพฤติกรรมและปัญหาที่พบ",
              },
              {
                stepNumber: "02",
                title: "Define",
                description: "Identify the Problem",
                quote: "กำหนดโจทย์และความต้องการของชุมชนอย่างชัดเจน",
              },
              {
                stepNumber: "03",
                title: "Ideate",
                description: "Brainstorming & Solution Architecture",
                quote: "ระดมความคิดและทดลองสร้าง Application / Prototype",
              },
            ],
          },
        },
        {
          type: "paragraph",
        },
      ])
      .run();
  };

  const handleToggleTimeline = () => {
    if (showTimelineEditor) {
      if (
        confirm(
          "Are you sure you want to turn off the Process Timeline block? It will be removed when saved."
        )
      ) {
        setShowTimelineEditor(false);
        if (onTimelineChange) onTimelineChange(null);
      }
    } else {
      setShowTimelineEditor(true);
      if (onTimelineChange && !timelineData) {
        onTimelineChange({
          title: "Process & Milestones",
          subtitle: "Step-by-step methodological journey",
          position: "bottom",
          steps: [
            {
              stepNumber: "01",
              title: "Empathize",
              description: "Interview & observation with core user groups.",
            },
            {
              stepNumber: "02",
              title: "Define",
              description: "Identified key problem statements and goals.",
            },
            {
              stepNumber: "03",
              title: "Ideate",
              description: "Brainstorming and prototyping solutions.",
            },
          ],
        });
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden space-y-2">
      {/* Primary Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border bg-surface-secondary/60 p-2 sm:p-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`rounded px-2 py-1 text-xs transition-colors font-medium ${
              editor.isActive("paragraph") && !editor.isActive("heading")
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Normal Paragraph"
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`rounded px-2 py-1 text-xs transition-colors font-bold ${
              editor.isActive("heading", { level: 2 })
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Heading 2 (Main Section)"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`rounded px-2 py-1 text-xs transition-colors font-semibold ${
              editor.isActive("heading", { level: 3 })
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Heading 3 (Subsection)"
          >
            H3
          </button>

          <span className="h-4 w-px bg-border mx-1" />

          {/* Alignment Controls (Left, Center, Right, Justify) */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Align Left (ชิดซ้าย)"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Align Center (จัดกึ่งกลาง)"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Align Right (ชิดขวา)"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive({ textAlign: "justify" })
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Justify (จัดเต็มขอบ)"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>

          <span className="h-4 w-px bg-border mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("bold")
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("italic")
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("strike")
                ? "bg-accent text-accent-foreground font-bold"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("highlight")
                ? "bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Highlight Text"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`rounded p-1.5 text-xs transition-colors font-mono ${
              editor.isActive("code")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </button>

          <span className="h-4 w-px bg-border mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("bulletList")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("orderedList")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          <span className="h-4 w-px bg-border mx-1" />

          {/* Quotes & Structure */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("blockquote")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Blockquote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Code Block"
          >
            <Type className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("link")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Insert Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>

          {/* Media Pickers */}
          <MediaPickerModal
            onSelect={(m) => addImage(m.url, m.altText || m.originalName)}
            trigger={
              <button
                type="button"
                className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                title="Insert Image from Library"
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </button>
            }
          />

          <button
            type="button"
            onClick={addYoutube}
            className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            title="Embed YouTube Video"
          >
            <Video className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            title="Horizontal Line Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          {/* Table Trigger */}
          <button
            type="button"
            onClick={() => {
              if (editor.isActive("table")) {
                editor.chain().focus().deleteTable().run();
              } else {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              }
            }}
            className={`rounded p-1.5 text-xs transition-colors ${
              editor.isActive("table")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
            title="Insert / Delete Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </button>

          {/* Clear Formatting / History */}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30"
            title="Redo"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Process Timeline Block Insertion & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleInsertTimelineMarker}
            className="h-7 px-3 text-xs gap-1.5 bg-accent text-accent-foreground font-semibold shadow-sm hover:brightness-110 transition-all"
            title="แทรกกล่อง Process & Milestones ณ ตำแหน่งเคอร์เซอร์ เพื่อให้สามารถพิมพ์ข้อความต่อด้านล่างกล่องได้ทันที"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>✨ แทรก Timeline ตรงนี้</span>
          </Button>

          {/* Autosave Status */}
          <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
            {saveStatus === "saving" && (
              <span className="text-amber-400 animate-pulse">Saving...</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-accent inline-flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>Saved ✓</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating / Active Image Resizing & Alignment Toolbar */}
      {editor.isActive("image") && (
        <div className="mx-2 p-2 rounded-lg bg-surface-secondary border border-accent/40 flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-accent flex items-center gap-1 px-1">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Image Size:</span>
            </span>

            <button
              type="button"
              onClick={() => updateSelectedImage({ width: "120px", display: "inline-block" })}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                imageAttributes?.width === "120px"
                  ? "bg-accent text-accent-foreground font-bold"
                  : "bg-surface hover:bg-surface-secondary text-foreground"
              }`}
              title="Icon / Badge Size (120px inline - perfect for tool logos!)"
            >
              Icon (120px)
            </button>

            <button
              type="button"
              onClick={() => updateSelectedImage({ width: "25%", display: "block" })}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                imageAttributes?.width === "25%"
                  ? "bg-accent text-accent-foreground font-bold"
                  : "bg-surface hover:bg-surface-secondary text-foreground"
              }`}
              title="Small Size (25% width)"
            >
              Small (25%)
            </button>

            <button
              type="button"
              onClick={() => updateSelectedImage({ width: "50%", display: "block" })}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                imageAttributes?.width === "50%"
                  ? "bg-accent text-accent-foreground font-bold"
                  : "bg-surface hover:bg-surface-secondary text-foreground"
              }`}
              title="Medium Size (50% width)"
            >
              Medium (50%)
            </button>

            <button
              type="button"
              onClick={() => updateSelectedImage({ width: "75%", display: "block" })}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                imageAttributes?.width === "75%"
                  ? "bg-accent text-accent-foreground font-bold"
                  : "bg-surface hover:bg-surface-secondary text-foreground"
              }`}
              title="Large Size (75% width)"
            >
              Large (75%)
            </button>

            <button
              type="button"
              onClick={() => updateSelectedImage({ width: "100%", display: "block" })}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                !imageAttributes?.width || imageAttributes?.width === "100%"
                  ? "bg-accent text-accent-foreground font-bold"
                  : "bg-surface hover:bg-surface-secondary text-foreground"
              }`}
              title="Full Width (100%)"
            >
              Full (100%)
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-semibold text-muted-foreground px-1">Align:</span>
            <button
              type="button"
              onClick={() => updateSelectedImage({ alignment: "left", display: "block" })}
              className={`p-1 rounded ${
                imageAttributes?.alignment === "left" && imageAttributes?.display === "block"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-surface text-muted-foreground"
              }`}
              title="Align Left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSelectedImage({ alignment: "center", display: "block" })}
              className={`p-1 rounded ${
                (!imageAttributes?.alignment || imageAttributes?.alignment === "center") && imageAttributes?.display !== "inline-block"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-surface text-muted-foreground"
              }`}
              title="Align Center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSelectedImage({ alignment: "right", display: "block" })}
              className={`p-1 rounded ${
                imageAttributes?.alignment === "right" && imageAttributes?.display === "block"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-surface text-muted-foreground"
              }`}
              title="Align Right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSelectedImage({ display: "inline-block", alignment: "center" })}
              className={`px-1.5 py-1 rounded text-[11px] flex items-center gap-1 ${
                imageAttributes?.display === "inline-block"
                  ? "bg-accent text-accent-foreground font-bold"
                  : "hover:bg-surface text-muted-foreground"
              }`}
              title="Inline - Place multiple images side-by-side on same row"
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Inline (เรียงแถว)</span>
            </button>

            <span className="h-4 w-px bg-border mx-1" />

            <button
              type="button"
              onClick={deleteSelectedImage}
              className="p-1 rounded text-destructive hover:bg-destructive/10"
              title="Delete Image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Process Timeline Builder Block (When position is TOP) */}
      {showTimelineEditor && editorBoxPosition === "top" && (
        <div className="p-4 border-b border-border bg-surface-secondary/30">
          <ProcessTimelineEditor
            initialData={timelineData || undefined}
            editorBoxPosition={editorBoxPosition}
            onToggleEditorBoxPosition={() => setEditorBoxPosition("bottom")}
            onInsertMarker={handleInsertTimelineMarker}
            onChange={(newData) => {
              if (onTimelineChange) onTimelineChange(newData);
            }}
            onRemove={() => {
              setShowTimelineEditor(false);
              if (onTimelineChange) onTimelineChange(null);
            }}
          />
        </div>
      )}

      {/* Editor Content Area with visible formatting */}
      <div className="p-3 sm:p-4 bg-surface-secondary/20 rounded-b-lg relative">
        {/* Floating Bubble Toolbar on Text Selection */}
        <EditorBubbleMenu
          editor={editor}
          onSetLink={setLink}
          onInsertTimeline={handleInsertTimelineMarker}
        />

        {/* Right-Click Context Menu */}
        <EditorContextMenu
          editor={editor}
          onOpenMediaModal={() => setIsContextMenuMediaOpen(true)}
          onInsertTimeline={handleInsertTimelineMarker}
          onSetLink={setLink}
        />

        {/* Context-triggered Media Picker Modal */}
        <MediaPickerModal
          isOpen={isContextMenuMediaOpen}
          onOpenChange={setIsContextMenuMediaOpen}
          onSelect={(m) => addImage(m.url, m.altText || m.originalName)}
        />

        <EditorContent editor={editor} />
      </div>

      {/* Process Timeline Builder Block (When position is BOTTOM) */}
      {showTimelineEditor && editorBoxPosition === "bottom" && (
        <div className="p-4 border-t border-border bg-surface-secondary/30">
          <ProcessTimelineEditor
            initialData={timelineData || undefined}
            editorBoxPosition={editorBoxPosition}
            onToggleEditorBoxPosition={() => setEditorBoxPosition("top")}
            onInsertMarker={handleInsertTimelineMarker}
            onChange={(newData) => {
              if (onTimelineChange) onTimelineChange(newData);
            }}
            onRemove={() => {
              setShowTimelineEditor(false);
              if (onTimelineChange) onTimelineChange(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
