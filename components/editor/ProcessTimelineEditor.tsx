"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Image as ImageIcon, Eye, MoveVertical, MapPin, AlignVerticalSpaceAround } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { ProcessTimelineBlock, TimelineStep } from "@/components/content/ProcessTimelineBlock";

export interface ProcessTimelineData {
  title: string;
  subtitle?: string;
  position?: "top" | "middle" | "bottom";
  steps: TimelineStep[];
}

interface ProcessTimelineEditorProps {
  initialData?: ProcessTimelineData;
  onChange: (data: ProcessTimelineData) => void;
  onRemove?: () => void;
  onInsertMarker?: () => void;
  editorBoxPosition?: "top" | "bottom";
  onToggleEditorBoxPosition?: () => void;
}

export function ProcessTimelineEditor({
  initialData,
  onChange,
  onRemove,
  onInsertMarker,
  editorBoxPosition = "bottom",
  onToggleEditorBoxPosition,
}: ProcessTimelineEditorProps) {
  const [data, setData] = useState<ProcessTimelineData>(() => {
    return (
      initialData || {
        title: "Process & Milestones",
        subtitle: "Step-by-step methodological journey",
        position: "bottom",
        steps: [
          {
            stepNumber: "01",
            title: "Empathize",
            description: "Interview & Observation with core user groups.",
            quote: "Understanding user friction before jumping into solutions.",
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
      }
    );
  });

  const [showPreview, setShowPreview] = useState(false);

  const updateData = (newData: ProcessTimelineData) => {
    setData(newData);
    onChange(newData);
  };

  const handleTitleChange = (title: string) => {
    updateData({ ...data, title });
  };

  const handleSubtitleChange = (subtitle: string) => {
    updateData({ ...data, subtitle });
  };

  const handlePositionChange = (position: "top" | "middle" | "bottom") => {
    updateData({ ...data, position });
  };

  const handleStepChange = (index: number, field: keyof TimelineStep, value: any) => {
    const newSteps = [...data.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    updateData({ ...data, steps: newSteps });
  };

  const addStep = () => {
    const nextNumber = String(data.steps.length + 1).padStart(2, "0");
    const newStep: TimelineStep = {
      stepNumber: nextNumber,
      title: "New Milestone",
      description: "Describe the architectural or design decisions taken in this phase.",
    };
    updateData({ ...data, steps: [...data.steps, newStep] });
  };

  const removeStep = (index: number) => {
    if (data.steps.length <= 1) {
      alert("At least one step is required in a Process Timeline.");
      return;
    }
    const newSteps = data.steps.filter((_, i) => i !== index);
    updateData({ ...data, steps: newSteps });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.steps.length) return;

    const newSteps = [...data.steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    updateData({ ...data, steps: newSteps });
  };

  const currentPos = data.position || "bottom";

  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Process Timeline Block (กล่องขั้นตอนการทำงาน)</span>
          </h3>
          <p className="text-[11px] text-muted-foreground">
            กำหนดตำแหน่งกล่องบนหน้าเว็บ และเขียนเนื้อหาต่อด้านบนหรือล่างได้อิสระ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Move Editor Box Position (Up / Down relative to text editor) */}
          {onToggleEditorBoxPosition && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs border-accent/40 text-accent hover:bg-accent/10"
              onClick={onToggleEditorBoxPosition}
              title="สลับตำแหน่งกล่องแก้ไขนี้ให้อยู่ด้านบนหรือด้านล่างของช่องพิมพ์เนื้อหา"
            >
              <MoveVertical className="h-3.5 w-3.5" />
              <span>{editorBoxPosition === "top" ? "ย้ายกล่องแก้ไขลงล่าง ⬇️" : "ย้ายกล่องแก้ไขขึ้นบน ⬆️"}</span>
            </Button>
          )}

          {onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (confirm("Are you sure you want to disable and remove this Process Timeline block?")) {
                  onRemove();
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Turn Off / Delete Timeline</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs border-border"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 text-xs bg-accent text-accent-foreground"
            onClick={addStep}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Step</span>
          </Button>
        </div>
      </div>

      {/* Position Controller on Public Page */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <AlignVerticalSpaceAround className="h-3.5 w-3.5 text-accent" />
            <span>ตำแหน่งการแสดงกล่องบนหน้าเว็บ (Public Page Position)</span>
          </Label>
          <span className="text-[10px] font-mono text-accent uppercase">
            {currentPos === "top" ? "⬆️ ด้านบนสุด" : currentPos === "middle" ? "📍 แทรกในเนื้อหา" : "⬇️ ด้านล่างสุด"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handlePositionChange("top")}
            className={`p-2 rounded-md border text-left text-xs transition-all ${
              currentPos === "top"
                ? "border-accent bg-accent/20 text-foreground font-semibold shadow-sm"
                : "border-border bg-surface hover:bg-surface-secondary text-muted-foreground"
            }`}
          >
            <div className="font-semibold text-accent flex items-center gap-1">
              <span>⬆️ อยู่บนสุด (Top)</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              กล่องจะอยู่บนสุด แล้วตามด้วยเนื้อหาทั้งหมดด้านล่าง
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              handlePositionChange("middle");
              if (onInsertMarker) onInsertMarker();
            }}
            className={`p-2 rounded-md border text-left text-xs transition-all ${
              currentPos === "middle"
                ? "border-accent bg-accent/20 text-foreground font-semibold shadow-sm"
                : "border-border bg-surface hover:bg-surface-secondary text-muted-foreground"
            }`}
          >
            <div className="font-semibold text-accent flex items-center gap-1">
              <span>📍 แทรกในเนื้อหา (Middle)</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              เขียนเนื้อหาก่อนหน้า → กล่องไทม์ไลน์ → เขียนต่อด้านล่าง
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePositionChange("bottom")}
            className={`p-2 rounded-md border text-left text-xs transition-all ${
              currentPos === "bottom"
                ? "border-accent bg-accent/20 text-foreground font-semibold shadow-sm"
                : "border-border bg-surface hover:bg-surface-secondary text-muted-foreground"
            }`}
          >
            <div className="font-semibold text-accent flex items-center gap-1">
              <span>⬇️ อยู่ล่างสุด (Bottom)</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              เนื้อหาบทความทั้งหมดอยู่ด้านบน แล้วจบด้วยกล่องนี้
            </div>
          </button>
        </div>
      </div>

      {/* Header Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Timeline Section Title</Label>
          <Input
            value={data.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Process & Milestones"
            className="text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Subtitle / Methodology Note</Label>
          <Input
            value={data.subtitle || ""}
            onChange={(e) => handleSubtitleChange(e.target.value)}
            placeholder="e.g. Step-by-step methodological journey"
            className="text-xs"
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {data.steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border/80 bg-surface-secondary/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/20 font-mono text-xs font-bold text-accent">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Milestone #{idx + 1}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveStep(idx, "up")}
                  className="rounded p-1 text-muted-foreground hover:bg-surface-secondary disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === data.steps.length - 1}
                  onClick={() => moveStep(idx, "down")}
                  className="rounded p-1 text-muted-foreground hover:bg-surface-secondary disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                  title="Delete Step"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-[11px]">Step Number</Label>
                <Input
                  value={step.stepNumber}
                  onChange={(e) => handleStepChange(idx, "stepNumber", e.target.value)}
                  placeholder="01"
                  className="h-8 font-mono text-xs"
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label className="text-[11px]">Milestone Title</Label>
                <Input
                  value={step.title}
                  onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                  placeholder="e.g. Empathize & Stakeholder Discovery"
                  className="h-8 text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Milestone Description</Label>
              <Textarea
                rows={2}
                value={step.description}
                onChange={(e) => handleStepChange(idx, "description", e.target.value)}
                placeholder="Explain the research, technical choices, or testing performed during this step..."
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px]">Optional Quote / Finding</Label>
                <Input
                  value={step.quote || ""}
                  onChange={(e) => handleStepChange(idx, "quote", e.target.value)}
                  placeholder="e.g. 'Users completed the flow 40% faster.'"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Supporting Media (Image URL)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={step.mediaUrl || ""}
                    onChange={(e) => handleStepChange(idx, "mediaUrl", e.target.value)}
                    placeholder="https://... or /uploads/media/..."
                    className="h-8 text-xs flex-1"
                  />
                  <MediaPickerModal
                    onSelect={(m) => {
                      handleStepChange(idx, "mediaUrl", m.url);
                      handleStepChange(idx, "mediaType", "image");
                    }}
                    trigger={
                      <Button type="button" variant="outline" size="sm" className="h-8 px-2">
                        <ImageIcon className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Preview Accordion */}
      {showPreview && (
        <div className="border-t border-border pt-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Live Public Preview:</div>
          <ProcessTimelineBlock
            title={data.title}
            subtitle={data.subtitle}
            steps={data.steps}
          />
        </div>
      )}
    </div>
  );
}
