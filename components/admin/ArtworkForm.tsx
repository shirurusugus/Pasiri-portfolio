"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Trash2, Copy, Plus, X, Image as ImageIcon, AlertCircle, Sparkles, Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { slugify } from "@/lib/utils";
import { safeFetchJson, createThumbnailDataUrl } from "@/lib/image-compress";

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
}

interface ProcessStep {
  label: string;
  imageUrl: string;
  description?: string;
}

interface ArtworkFormProps {
  initialData?: any;
  categories: { id: string; name: string }[];
  isEditing?: boolean;
}

export function ArtworkForm({
  initialData,
  categories = [],
  isEditing = false,
}: ArtworkFormProps) {
  const router = useRouter();

  let initialProcess: ProcessStep[] = [];
  if (initialData?.processImages) {
    try {
      initialProcess = JSON.parse(initialData.processImages);
    } catch {}
  }

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    year: initialData?.year || new Date().getFullYear(),
    date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    medium: initialData?.medium || "Digital Painting",
    software: initialData?.software || "Procreate",
    dimensions: initialData?.dimensions || "3840 × 2160 px",
    imageUrl: initialData?.imageUrl || "",
    thumbnailUrl: initialData?.thumbnailUrl || "",
    videoUrl: initialData?.videoUrl || "",
    tags: initialData?.tags || "",
    featured: initialData?.featured || false,
    status: initialData?.status || "DRAFT",
    sortOrder: initialData?.sortOrder || 0,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
  });

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(initialProcess);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isEditing || !prev.slug ? slugify(val) : prev.slug,
    }));
  };

  const handleAddProcessStep = () => {
    setProcessSteps([
      ...processSteps,
      { label: `0${processSteps.length + 1}. Stage Name`, imageUrl: "", description: "" },
    ]);
  };

  const handleUpdateProcessStep = (index: number, field: keyof ProcessStep, value: string) => {
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    setProcessSteps(updated);
  };

  const handleRemoveProcessStep = (index: number) => {
    setProcessSteps(processSteps.filter((_, i) => i !== index));
  };

  const handlePrimaryImageChange = async (url: string) => {
    let newThumb = formData.thumbnailUrl;
    if (url) {
      try {
        const generatedThumb = await createThumbnailDataUrl(url, 480, 0.75);
        if (generatedThumb) newThumb = generatedThumb;
      } catch (e) {
        console.warn("Could not auto-generate thumbnail:", e);
      }
    } else {
      newThumb = "";
    }
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
      thumbnailUrl: newThumb,
    }));
  };

  const handleSave = async (statusOverride?: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    setLoading(true);
    setError("");

    const targetStatus = statusOverride || formData.status;

    let finalThumb = formData.thumbnailUrl;
    if (formData.imageUrl && !finalThumb) {
      try {
        finalThumb = await createThumbnailDataUrl(formData.imageUrl, 480, 0.75);
      } catch {}
    }

    try {
      const url = isEditing ? `/api/admin/artworks/${initialData.id}` : "/api/admin/artworks";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          thumbnailUrl: finalThumb,
          status: targetStatus,
          processImages: processSteps.length > 0 ? JSON.stringify(processSteps) : null,
        }),
      });

      const data = await safeFetchJson(res);
      if (!res.ok) throw new Error(data.error || "Failed to save artwork");

      if (!isEditing && data.artwork?.id) {
        router.push(`/admin/digital-art/${data.artwork.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save artwork");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!confirm(`Duplicate this artwork as a new draft?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          title: `${formData.title} (Copy)`,
          slug: `${formData.slug}-copy-${Date.now().toString().slice(-4)}`,
          status: "DRAFT",
          processImages: processSteps.length > 0 ? JSON.stringify(processSteps) : null,
        }),
      });
      const data = await safeFetchJson(res);
      if (res.ok && data.artwork?.id) {
        router.push(`/admin/digital-art/${data.artwork.id}`);
      }
    } catch (err) {
      alert("Failed to duplicate artwork");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${formData.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/artworks/${initialData.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/digital-art");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete artwork");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Link href="/admin/digital-art">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEditing ? `Edit Artwork: ${formData.title || "Untitled"}` : "Add New Digital Artwork"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `Status: ${formData.status}` : "Upload artwork, set medium, dimensions, and process stages."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <>
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
                <Link href={`/digital-art/${initialData.slug}`} target="_blank">
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
            <span>{formData.status === "PUBLISHED" ? "Save & Update" : "Publish Artwork"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Col (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Artwork Identity</h2>

            <div className="space-y-1.5">
              <Label className="text-xs">Artwork Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Ethereal Canopy — Forest Atmosphere Study"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">URL Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ethereal-canopy"
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Category</Label>
                  <Link href="/admin/digital-art/categories" className="text-[10px] text-accent hover:underline">
                    Manage Categories
                  </Link>
                </div>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description & Concept Notes</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Creative intention, lighting study, thematic inspiration..."
              />
            </div>
          </div>

          {/* YouTube Video / Speedpaint Process Section */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Video className="h-4 w-4 text-accent" />
                <span>Speedpaint / Process Video (YouTube)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ใส่วิดีโอ Speedpaint หรือ Timelapse ขั้นตอนการวาดจาก YouTube เพื่อแสดงในหน้าผลงาน
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">YouTube Video URL</Label>
              <Input
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                รองรับ URL ทุกรูปแบบ (เช่น youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...)
              </p>
            </div>

            {/* Live Video Preview */}
            {getYouTubeEmbedUrl(formData.videoUrl) && (
              <div className="space-y-2 pt-2 border-t border-border/50 animate-in fade-in">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ตัวอย่างวิดีโอ (Live Preview)</span>
                </span>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(formData.videoUrl)!}
                    title="YouTube video preview"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Process / Behind the Work Stages */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Process & Behind the Work Stages
                </h2>
                <p className="text-xs text-muted-foreground">
                  Showcase progression (e.g. Sketch → Line Art → Value Study → Final Render).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={handleAddProcessStep}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Stage</span>
              </Button>
            </div>

            {processSteps.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No process breakdown added yet. Click "Add Stage" to show your workflow.
              </div>
            ) : (
              <div className="space-y-4">
                {processSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-surface-secondary/40 p-4 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveProcessStep(idx)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive text-xs"
                      title="Remove Stage"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Stage Label</Label>
                        <Input
                          value={step.label}
                          onChange={(e) => handleUpdateProcessStep(idx, "label", e.target.value)}
                          placeholder="e.g. 01. Thumbnail Value Sketch"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px]">Stage Image URL</Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            value={step.imageUrl}
                            onChange={(e) => handleUpdateProcessStep(idx, "imageUrl", e.target.value)}
                            placeholder="https://..."
                            className="text-xs"
                          />
                          <MediaPickerModal
                            onSelect={(m) => handleUpdateProcessStep(idx, "imageUrl", m.url)}
                            trigger={
                              <Button type="button" variant="outline" size="sm" className="px-2 text-xs">
                                Pick
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Stage Description</Label>
                      <Input
                        value={step.description || ""}
                        onChange={(e) => handleUpdateProcessStep(idx, "description", e.target.value)}
                        placeholder="What was explored during this phase..."
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Artwork Image */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Primary Artwork Image
            </h3>

            <ImageUploadField
              value={formData.imageUrl}
              onChange={handlePrimaryImageChange}
              folder="artworks"
              placeholder="High-res artwork image URL or upload"
              required
            />
          </div>

          {/* Gallery Thumbnail (Auto-generated & editable) */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gallery Thumbnail
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Auto-generated</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Used in gallery cards for lightning-fast loading. Automatically created from primary image.
            </p>
            <ImageUploadField
              value={formData.thumbnailUrl}
              onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
              folder="artworks"
              placeholder="Auto-generated thumbnail URL"
            />
          </div>

          {/* Specifications */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Specifications
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Medium</Label>
              <Input
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                placeholder="Digital Painting / Concept Art"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Software / Tools</Label>
              <Input
                value={formData.software}
                onChange={(e) => setFormData({ ...formData, software: e.target.value })}
                placeholder="Procreate / Photoshop / Clip Studio"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Canvas Dimensions</Label>
              <Input
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="3840 × 2160 px"
                className="text-xs font-mono"
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
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Landscape, Sci-Fi, Character"
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

          {/* SEO */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SEO Metadata
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
