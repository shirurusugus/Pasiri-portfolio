"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Trash2, Copy, Check, AlertCircle, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ProcessTimelineData } from "@/components/editor/ProcessTimelineEditor";
import { slugify } from "@/lib/utils";

interface ActivityFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ActivityForm({ initialData, isEditing = false }: ActivityFormProps) {
  const router = useRouter();

  const initialTimeline = initialData?.blocks?.find(
    (b: any) => b.type === "process_timeline"
  )?.data;

  let parsedTimeline: ProcessTimelineData | null = null;
  if (initialTimeline) {
    try {
      parsedTimeline = typeof initialTimeline === "string" ? JSON.parse(initialTimeline) : initialTimeline;
    } catch {}
  }

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortSummary: initialData?.shortSummary || "",
    category: initialData?.category || "Competition",
    organization: initialData?.organization || "",
    role: initialData?.role || "",
    location: initialData?.location || "",
    eventDate: initialData?.eventDate ? new Date(initialData.eventDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : "",
    coverImage: initialData?.coverImage || "",
    galleryImages: initialData?.galleryImages || "",
    videoUrl: initialData?.videoUrl || "",
    objectives: initialData?.objectives || "",
    responsibilities: initialData?.responsibilities || "",
    outcomes: initialData?.outcomes || "",
    reflection: initialData?.reflection || "",
    skillsGained: initialData?.skillsGained || "",
    tags: initialData?.tags || "",
    externalUrl: initialData?.externalUrl || "",
    githubUrl: initialData?.githubUrl || "",
    certificateUrl: initialData?.certificateUrl || "",
    featured: initialData?.featured || false,
    status: initialData?.status || "DRAFT",
    sortOrder: initialData?.sortOrder || 0,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    rawContent: initialData?.rawContent || "",
  });

  const hasInitialDetails = !!(
    initialData?.objectives ||
    initialData?.responsibilities ||
    initialData?.outcomes ||
    initialData?.reflection
  );
  const [showDetailsSection, setShowDetailsSection] = useState(hasInitialDetails);
  const [timelineData, setTimelineData] = useState<ProcessTimelineData | null>(parsedTimeline);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isEditing || !prev.slug ? slugify(val) : prev.slug,
    }));
  };

  const handleSave = async (statusOverride?: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    setLoading(true);
    setSaveStatus("saving");
    setError("");

    const targetStatus = statusOverride || formData.status;

    try {
      const url = isEditing ? `/api/admin/activities/${initialData.id}` : "/api/admin/activities";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        objectives: showDetailsSection ? formData.objectives : "",
        responsibilities: showDetailsSection ? formData.responsibilities : "",
        outcomes: showDetailsSection ? formData.outcomes : "",
        reflection: showDetailsSection ? formData.reflection : "",
        status: targetStatus,
        timelineData,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save activity");

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);

      if (!isEditing && data.activity?.id) {
        router.push(`/admin/activities/${data.activity.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save activity");
      setSaveStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!confirm(`Duplicate this activity as a new draft?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          title: `${formData.title} (Copy)`,
          slug: `${formData.slug}-copy-${Date.now().toString().slice(-4)}`,
          status: "DRAFT",
          timelineData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.activity?.id) {
        router.push(`/admin/activities/${data.activity.id}`);
      }
    } catch (err) {
      alert("Failed to duplicate activity");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${formData.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/activities/${initialData.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/activities");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete activity");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Link href="/admin/activities">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEditing ? `Edit Activity: ${formData.title || "Untitled"}` : "Create New Activity / Event / Case Study"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `Status: ${formData.status}` : "Configure activity details, cover, process timeline, and outcomes."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <>
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
                <Link href={`/activities/${initialData.slug}`} target="_blank">
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Public Page</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-border"
                onClick={handleDuplicate}
                disabled={loading}
                title="Duplicate this activity"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border"
            disabled={loading}
            onClick={() => handleSave("DRAFT")}
          >
            Save Draft
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-8 text-xs bg-accent text-accent-foreground gap-1.5"
            disabled={loading}
            onClick={() => handleSave("PUBLISHED")}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{formData.status === "PUBLISHED" ? "Save & Update" : "Publish Activity"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Core Fields & Rich Narrative Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Activity Identity</h2>

            <div className="space-y-1.5">
              <Label className="text-xs">Activity / Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Global Game Jam 2026 — Bangkok Node"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">URL Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="global-game-jam-2026"
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Competition">Competition / Hackathon</SelectItem>
                    <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Teaching">Teaching Assistant / Education</SelectItem>
                    <SelectItem value="Exhibition">Exhibition / Thesis</SelectItem>
                    <SelectItem value="Community">Community / Watch Party</SelectItem>
                    <SelectItem value="Project">Design Project / Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Role Title</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Lead UI/UX Designer"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Organization / Context</Label>
                <Input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Global Game Jam Bangkok / SCG WEDO"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Short Summary / Intro</Label>
              <Textarea
                rows={3}
                value={formData.shortSummary}
                onChange={(e) => setFormData({ ...formData, shortSummary: e.target.value })}
                placeholder="High-level description of the challenge, role, and key takeaways..."
                required
              />
            </div>
          </div>

          {/* Objectives, Responsibilities & Outcomes (Optional Toggleable Section) */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold text-foreground">
                  Objectives, Responsibilities & Outcomes
                </h2>
                <span className="text-[10px] font-mono rounded bg-surface-secondary px-2 py-0.5 text-muted-foreground border border-border/50">
                  {showDetailsSection ? "เปิดใช้งาน (Active)" : "ไม่ใช้งาน (Optional)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {showDetailsSection ? "เปิดใช้งานส่วนนี้" : "ปิดส่วนนี้ไว้"}
                </span>
                <Switch
                  checked={showDetailsSection}
                  onCheckedChange={setShowDetailsSection}
                />
              </div>
            </div>

            {showDetailsSection ? (
              <div className="space-y-4 pt-3 border-t border-border/60 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs">Objectives & Challenge</Label>
                  <Textarea
                    rows={2}
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    placeholder="Core goals, constraints, and problem statement..."
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Key Responsibilities</Label>
                  <Textarea
                    rows={2}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    placeholder="Specific design tasks, artifacts delivered, or team coordination..."
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Results & Outcomes</Label>
                    <Textarea
                      rows={2}
                      value={formData.outcomes}
                      onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                      placeholder="Awards, metrics, user test findings..."
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Designer Reflection</Label>
                    <Textarea
                      rows={2}
                      value={formData.reflection}
                      onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                      placeholder="Personal learnings and design insights..."
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                <p className="text-[11px]">
                  💡 ซ่อนส่วนนี้อยู่ — คุณสามารถเขียนทุกอย่างลงในช่อง Detailed Narrative ด้านล่างได้โดยตรง
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsSection(true)}
                  className="h-7 text-xs text-accent border-accent/30 bg-accent/5 hover:bg-accent/10"
                >
                  + เปิดใช้งานเพื่อกรอกข้อมูล
                </Button>
              </div>
            )}
          </div>

          {/* Rich Content & Process Timeline Builder */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detailed Narrative & Process Timeline
            </Label>
            <RichTextEditor
              content={formData.rawContent}
              timelineData={timelineData}
              saveStatus={saveStatus}
              onChange={(html) => setFormData((prev) => ({ ...prev, rawContent: html }))}
              onTimelineChange={(newTimeline) => setTimelineData(newTimeline)}
            />
          </div>
        </div>

        {/* Right Column: Dates, Cover, Links, and SEO (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cover Image */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cover Image
            </h3>

            <ImageUploadField
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              folder="activities"
              placeholder="Cover image URL or upload from device"
            />
          </div>

          {/* Dates & Location */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dates & Location
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Event / Completed Date</Label>
              <Input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangkok, Thailand"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Skills & Tools Gained (comma-separated)</Label>
              <Input
                value={formData.skillsGained}
                onChange={(e) => setFormData({ ...formData, skillsGained: e.target.value })}
                placeholder="Figma, Service Blueprinting, Accessibility"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Hackathon, Transit UX, Mobile"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between rounded-lg border border-border p-2">
                  <span className="text-xs">Featured</span>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Links & Credentials */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              External Links & Credentials
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Live URL / Presentation</Label>
              <Input
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">GitHub / Code Repository</Label>
              <Input
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Certificate URL</Label>
              <Input
                value={formData.certificateUrl}
                onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SEO Optimization
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">SEO Title Tag</Label>
              <Input
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Custom title tag..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">SEO Meta Description</Label>
              <Textarea
                rows={2}
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="Search engine summary..."
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
