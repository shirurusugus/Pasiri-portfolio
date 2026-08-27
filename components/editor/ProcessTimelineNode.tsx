"use client";

import React, { useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Sparkles, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TimelineStep } from "@/components/content/ProcessTimelineBlock";

// ----------------------------------------------------
// React Component rendered inside TipTap Editor
// ----------------------------------------------------
function ProcessTimelineNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(true);

  // Controlled values using nullish coalescing to NEVER overwrite empty string with defaults
  const title = node.attrs.title ?? "";
  const subtitle = node.attrs.subtitle ?? "";
  const steps: TimelineStep[] = Array.isArray(node.attrs.steps)
    ? node.attrs.steps
    : [];

  const handleTitleChange = (val: string) => {
    updateAttributes({ title: val });
  };

  const handleSubtitleChange = (val: string) => {
    updateAttributes({ subtitle: val });
  };

  const handleStepChange = (index: number, key: keyof TimelineStep, value: any) => {
    const nextSteps = steps.map((s, i) => (i === index ? { ...s, [key]: value } : s));
    updateAttributes({ steps: nextSteps });
  };

  const addStep = () => {
    const nextNumber = String(steps.length + 1).padStart(2, "0");
    const nextSteps = [
      ...steps,
      {
        stepNumber: nextNumber,
        title: "",
        description: "",
        quote: "",
      },
    ];
    updateAttributes({ steps: nextSteps });
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const nextSteps = steps.filter((_, i) => i !== index);
    updateAttributes({ steps: nextSteps });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= steps.length) return;
    const nextSteps = [...steps];
    const temp = nextSteps[index];
    nextSteps[index] = nextSteps[target];
    nextSteps[target] = temp;
    updateAttributes({ steps: nextSteps });
  };

  return (
    <NodeViewWrapper className="my-8 block select-none not-prose">
      <div className="overflow-hidden rounded-2xl border-2 border-accent/40 bg-surface/90 shadow-xl backdrop-blur-md transition-all">
        {/* Card Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-secondary/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  ⏱️ Process & Milestones Box
                </span>
                <span className="rounded bg-accent/20 px-1.5 py-0.2 font-mono text-[9px] text-accent">
                  INLINE BLOCK
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                กล่องนี้อยู่ตรงนี้ในเนื้อหา — คุณสามารถคลิกพิมพ์ต่อด้านล่างกล่องได้เลย
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-[11px] border-border"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span>ย่อกล่องแก้ไข</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span>แก้ไขขั้นตอน ({steps.length})</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={deleteNode}
              title="Delete Timeline Block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Collapsible Editor Form */}
        {isEditing ? (
          <div className="p-4 sm:p-5 space-y-5">
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[11px]">หัวข้อกล่อง (Title)</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Process & Milestones"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">คำอธิบายย่อย (Subtitle)</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => handleSubtitleChange(e.target.value)}
                  placeholder="e.g. Step-by-step methodological journey"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>ขั้นตอนการทำงาน ({steps.length} Milestones)</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={addStep}
                  className="h-7 gap-1 bg-accent text-accent-foreground text-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>เพิ่มขั้นตอน</span>
                </Button>
              </div>

              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 bg-surface-secondary/40 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/20 font-mono text-[10px] font-bold text-accent">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        ขั้นตอนที่ #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveStep(idx, "up")}
                        className="rounded p-1 text-muted-foreground hover:bg-surface disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === steps.length - 1}
                        onClick={() => moveStep(idx, "down")}
                        className="rounded p-1 text-muted-foreground hover:bg-surface disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="rounded p-1 text-destructive hover:bg-destructive/10"
                        title="Delete Step"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <div>
                      <Label className="text-[10px]">ลำดับ</Label>
                      <Input
                        value={step.stepNumber || ""}
                        onChange={(e) => handleStepChange(idx, "stepNumber", e.target.value)}
                        placeholder="01"
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-[10px]">ชื่อขั้นตอน (Milestone Title)</Label>
                      <Input
                        value={step.title || ""}
                        onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                        placeholder="e.g. Empathize & User Interviews"
                        className="h-7 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px]">รายละเอียด (Description)</Label>
                    <Textarea
                      rows={2}
                      value={step.description || ""}
                      onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                      placeholder="อธิบายสิ่งที่ทำ ค้นพบ หรือแก้ปัญหาในสเต็ปนี้..."
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px]">ข้อความเน้น / คำคม / ข้อค้นพบ (Optional Quote)</Label>
                    <Input
                      value={step.quote || ""}
                      onChange={(e) => handleStepChange(idx, "quote", e.target.value)}
                      placeholder="e.g. 'ลงพื้นที่พูดคุยกับกลุ่มเพื่อทำความเข้าใจพฤติกรรม...'"
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Collapsed Mini Preview */
          <div className="p-4 bg-surface/50 text-xs text-muted-foreground flex items-center justify-between">
            <div>
              <span className="font-semibold text-foreground">{title || "Process & Milestones"}</span> — {steps.length} ขั้นตอน
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-accent"
              onClick={() => setIsEditing(true)}
            >
              คลิกเพื่อเปิดแก้ไข
            </Button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ----------------------------------------------------
// TipTap Custom Node Extension
// ----------------------------------------------------
export const ProcessTimelineNode = Node.create({
  name: "processTimeline",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      title: {
        default: "Process & Milestones",
        parseHTML: (element) => element.getAttribute("data-title") ?? "",
        renderHTML: (attributes) => ({
          "data-title": attributes.title ?? "",
        }),
      },
      subtitle: {
        default: "Step-by-step methodological journey",
        parseHTML: (element) => element.getAttribute("data-subtitle") ?? "",
        renderHTML: (attributes) => ({
          "data-subtitle": attributes.subtitle ?? "",
        }),
      },
      steps: {
        default: [
          {
            stepNumber: "01",
            title: "Empathize",
            description: "Interview & Observation",
            quote: "ทำความเข้าใจปัญหาและพฤติกรรมของผู้ใช้จริง",
          },
          {
            stepNumber: "02",
            title: "Define",
            description: "Identify the Problem",
            quote: "กำหนดโจทย์และเป้าหมายที่ชัดเจนในการแก้ปัญหา",
          },
          {
            stepNumber: "03",
            title: "Ideate",
            description: "Brainstorming & Prototyping",
            quote: "ระดมความคิดและทดลองสร้างต้นแบบจำลอง",
          },
        ],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-steps");
          if (raw) {
            try {
              return JSON.parse(decodeURIComponent(raw));
            } catch {
              try {
                return JSON.parse(raw);
              } catch {}
            }
          }
          return undefined;
        },
        renderHTML: (attributes) => {
          const serialized = encodeURIComponent(JSON.stringify(attributes.steps || []));
          return {
            "data-steps": serialized,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="process-timeline"]',
      },
      {
        tag: "process-timeline",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "process-timeline",
        class: "process-timeline-embed my-8",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProcessTimelineNodeView);
  },
});
