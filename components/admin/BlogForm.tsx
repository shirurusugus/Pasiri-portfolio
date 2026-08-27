"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Trash2, Check, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ProcessTimelineData } from "@/components/editor/ProcessTimelineEditor";
import { slugify } from "@/lib/utils";
import { safeFetchJson } from "@/lib/image-compress";

interface BlogFormProps {
  initialData?: any;
  categories?: any[];
  isEditing?: boolean;
}

export function BlogForm({ initialData, categories = [], isEditing = false }: BlogFormProps) {
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
    excerpt: initialData?.excerpt || "",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    author: initialData?.author || "pasiri",
    coverImage: initialData?.coverImage || "",
    featured: initialData?.featured || false,
    status: initialData?.status || "DRAFT",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    rawContent: initialData?.rawContent || "",
  });

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
      const url = isEditing ? `/api/admin/blog/${initialData.id}` : "/api/admin/blog";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: targetStatus,
          timelineData,
        }),
      });

      const data = await safeFetchJson(res);
      if (!res.ok) throw new Error(data.error || "Failed to save article");

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);

      if (!isEditing && data.post?.id) {
        router.push(`/admin/blog/${data.post.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save article");
      setSaveStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${formData.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blog/${initialData.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/blog");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete article");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEditing ? `Edit Article: ${formData.title || "Untitled"}` : "Write New Blog Article"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing ? `Status: ${formData.status}` : "Compose long-form essay with rich media and process documentation."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <>
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
                <Link href={`/admin/blog/${initialData.id}/preview`} target="_blank">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Link>
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
            <span>{formData.status === "PUBLISHED" ? "Save & Update" : "Publish Article"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form & Content Editor */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Article Details</h2>

            <div className="space-y-1.5">
              <Label className="text-xs">Article Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Designing Calm Interfaces: The Balance of Atmosphere and Usability"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">URL Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="designing-calm-interfaces"
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val === "none" ? null : val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorized</SelectItem>
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
              <Label className="text-xs">Excerpt / Lead Paragraph</Label>
              <Textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A compelling synopsis of this essay..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Article Content & Process Milestones
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

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cover Image
            </h3>

            {formData.coverImage ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border">
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: "" })}
                  className="absolute top-2 right-2 rounded-md bg-black/70 p-1 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center p-4">
                <ImageIcon className="h-6 w-6 text-muted-foreground/60 mb-2" />
                <p className="text-xs text-muted-foreground">No cover image selected</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="Image URL or pick from library"
                className="text-xs"
              />
              <MediaPickerModal
                onSelect={(m) => setFormData({ ...formData, coverImage: m.url })}
                trigger={
                  <Button type="button" variant="outline" size="sm" className="px-2.5">
                    Pick
                  </Button>
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Publishing Options
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Author Name</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-xs font-medium">Featured Story</span>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>
          </div>

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
