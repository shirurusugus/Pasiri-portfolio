"use client";

import React, { useState, useEffect } from "react";
import { Save, Check, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

export default function AdminSEOPage() {
  const [formData, setFormData] = useState({
    siteTitle: "pasiri — Portfolio, Projects & Writing",
    siteDescription: "Personal digital home, engineering portfolio, activities, and design case studies of pasiri.",
    authorName: "pasiri",
    keywords: "pasiri, software engineer, product designer, frontend, case studies, nextjs",
    defaultOgImage: "",
    twitterHandle: "@pasiri",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/",
    sitemapEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSEO() {
      try {
        const res = await fetch("/api/admin/website/seo");
        if (res.ok) {
          const data = await res.json();
          if (data.seo) {
            setFormData({
              siteTitle: data.seo.siteTitle || "",
              siteDescription: data.seo.siteDescription || "",
              authorName: data.seo.authorName || "",
              keywords: data.seo.keywords || "",
              defaultOgImage: data.seo.defaultOgImage || "",
              twitterHandle: data.seo.twitterHandle || "",
              robotsTxt: data.seo.robotsTxt || "",
              sitemapEnabled: data.seo.sitemapEnabled ?? true,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSEO();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/website/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save SEO settings");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            SEO & Search Optimization
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure global meta tags, OpenGraph previews, robots.txt indexing, and XML sitemaps.
          </p>
        </div>

        <Button type="submit" size="sm" className="gap-1.5 text-xs bg-accent text-accent-foreground" disabled={saving}>
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Saved ✓</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save SEO Settings"}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Global Meta Tags</h2>

          <div className="space-y-1.5">
            <Label className="text-xs">Default Site Title</Label>
            <Input
              value={formData.siteTitle}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Default Meta Description</Label>
            <Textarea
              rows={3}
              value={formData.siteDescription}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Keywords (comma-separated)</Label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Author Metadata Name</Label>
              <Input
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Twitter / X Handle</Label>
              <Input
                value={formData.twitterHandle}
                onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Social Share Card (Open Graph)</h2>

          <div className="space-y-1.5">
            <Label className="text-xs">Default Open Graph Image URL</Label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.defaultOgImage}
                onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })}
                placeholder="https://... or select image"
              />
              <MediaPickerModal
                onSelect={(m) => setFormData({ ...formData, defaultOgImage: m.url })}
                trigger={<Button type="button" variant="outline" size="sm">Pick</Button>}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Robots.txt & Sitemap</h2>

          <div className="space-y-1.5">
            <Label className="text-xs">Robots.txt Rules</Label>
            <Textarea
              rows={4}
              value={formData.robotsTxt}
              onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <span className="text-xs font-medium">Automatic XML Sitemap</span>
              <p className="text-[11px] text-muted-foreground">Generates /sitemap.xml with all published pages</p>
            </div>
            <Switch
              checked={formData.sitemapEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, sitemapEnabled: checked })}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
