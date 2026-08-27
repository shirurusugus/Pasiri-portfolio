"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Trash2, Copy, AlertCircle, Image as ImageIcon } from "lucide-react";
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
import { safeFetchJson } from "@/lib/image-compress";

interface ProjectFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
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
    year: initialData?.year || new Date().getFullYear(),
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : "",
    role: initialData?.role || "",
    team: initialData?.team || "",
    organization: initialData?.organization || "",
    category: initialData?.category || "UX/UI Design",
    tags: initialData?.tags || "",
    technologies: initialData?.technologies || "",
    tools: initialData?.tools || "",
    coverImage: initialData?.coverImage || "",
    galleryImages: initialData?.galleryImages || "",
    problem: initialData?.problem || "",
    outcomes: initialData?.outcomes || "",
    reflection: initialData?.reflection || "",
    externalUrl: initialData?.externalUrl || "",
    githubUrl: initialData?.githubUrl || "",
    relatedActivitySlug: initialData?.relatedActivitySlug || "",
    featured: initialData?.featured || false,
    status: initialData?.status || "DRAFT",
    sortOrder: initialData?.sortOrder || 0,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    rawContent: initialData?.rawContent || "",
  });

  const hasInitialDetails = !!(
    initialData?.problem ||
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
      const url = isEditing ? `/api/admin/projects/${initialData.id}` : "/api/admin/projects";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        problem: showDetailsSection ? formData.problem : "",
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

      const data = await safeFetchJson(res);
      if (!res.ok) throw new Error(data.error || "Failed to save project");

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);

      if (!isEditing && data.project?.id) {
        router.push(`/admin/projects/${data.project.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save project");
      setSaveStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!confirm(`Duplicate this project as a new draft?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
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
      const data = await safeFetchJson(res);
      if (res.ok && data.project?.id) {
        router.push(`/admin/projects/${data.project.id}`);
      }
    } catch (err) {
      alert("Failed to duplicate project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${formData.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/projects/${initialData.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEditing ? `Edit Project: ${formData.title || "Untitled"}` : "Create New Project Case Study"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `Status: ${formData.status}` : "Configure metadata, problem statement, outcomes, and process timeline."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <>
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
                <Link href={`/projects/${initialData.slug}`} target="_blank">
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
            <span>{formData.status === "PUBLISHED" ? "Save & Update" : "Publish Project"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left 8 cols, Right 4 cols */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Identity, Problem & Narrative (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Project Identity</h2>

            <div className="space-y-1.5">
              <Label className="text-xs">Project Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Vokabloom — Thai Language Morphology Platform"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">URL Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="vokabloom"
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
                    <SelectItem value="UX/UI Design">UX/UI Design</SelectItem>
                    <SelectItem value="Product Design">Product Design</SelectItem>
                    <SelectItem value="Design Systems">Design Systems</SelectItem>
                    <SelectItem value="Mobile">Mobile Application</SelectItem>
                    <SelectItem value="Web Application">Web Application</SelectItem>
                    <SelectItem value="Research">Research & HCI</SelectItem>
                    <SelectItem value="Service Design">Service Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Short Summary / Excerpt</Label>
              <Textarea
                rows={3}
                value={formData.shortSummary}
                onChange={(e) => setFormData({ ...formData, shortSummary: e.target.value })}
                placeholder="High-level description of the project problem, role, and outcome..."
                required
              />
            </div>
          </div>

          {/* Problem, Outcomes & Reflection (Optional Toggleable Section) */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold text-foreground">
                  Problem, Outcomes & Reflection
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
                  <Label className="text-xs">The Challenge / Problem Statement</Label>
                  <Textarea
                    rows={2}
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    placeholder="Core issue being solved, target audience pain points..."
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Results & Measurable Outcomes</Label>
                    <Textarea
                      rows={2}
                      value={formData.outcomes}
                      onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                      placeholder="Metrics, adoption, user satisfaction..."
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Designer Reflection & Lessons</Label>
                    <Textarea
                      rows={2}
                      value={formData.reflection}
                      onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                      placeholder="Key insights, technical learnings..."
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                <p className="text-[11px]">
                  💡 ซ่อนส่วนนี้อยู่ — คุณสามารถเขียนกรณีศึกษาทั้งหมดลงในช่อง Detailed Case Study ด้านล่างได้โดยตรง
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

          {/* Rich Text Editor & Process Timeline Builder */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detailed Case Study & Process Timeline
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

        {/* Right Column: Metadata, Cover Image, and SEO (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cover Image */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cover Image
            </h3>

            <ImageUploadField
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              folder="projects"
              placeholder="Cover image URL or upload from device"
            />
          </div>

          {/* Project Details & Roles */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Context
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Your Role</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Product Designer"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Team / Collaborators</Label>
              <Input
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="e.g. Solo / 3-Person HCI Team"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Organization / Client</Label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. SCG WEDO / KMITL IT"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Year</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Design Tools (comma-separated)</Label>
              <Input
                value={formData.tools}
                onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                placeholder="Figma, FigJam, Procreate, Miro"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tech Stack (comma-separated)</Label>
              <Input
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="Next.js, TypeScript, Tailwind, WebAudio"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Linguistics, Accessibility, Mobile"
                className="text-xs"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between rounded-lg border border-border p-2">
                <span className="text-xs font-medium">Featured on Homepage</span>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
            </div>
          </div>

          {/* Links & References */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Links & References
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Live Demo URL</Label>
              <Input
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">GitHub Repository</Label>
              <Input
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Related Activity Slug</Label>
              <Input
                value={formData.relatedActivitySlug}
                onChange={(e) => setFormData({ ...formData, relatedActivitySlug: e.target.value })}
                placeholder="e.g. mini-thesis-exhibition-2025"
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SEO Optimization
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">SEO Title</Label>
              <Input
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Custom title tag..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">SEO Description</Label>
              <Textarea
                rows={2}
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="Search engine meta description..."
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
