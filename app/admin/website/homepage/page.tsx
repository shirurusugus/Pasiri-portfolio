"use client";

import React, { useState, useEffect } from "react";
import { Save, ArrowUp, ArrowDown, Check, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SectionItem {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  order: number;
  isEnabled: boolean;
  customData?: string | null;
}

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website/homepage");
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleToggle = (id: string, isEnabled: boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled } : s))
    );
  };

  const handleTitleChange = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const handleSubtitleChange = (id: string, subtitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, subtitle } : s))
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate order indices
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    setSections(reordered);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/website/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (!res.ok) throw new Error("Failed to update sections");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Homepage Section Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enable, disable, reorder, and configure titles for all homepage sections.
          </p>
        </div>

        <Button onClick={handleSave} size="sm" className="gap-1.5 text-xs bg-accent text-accent-foreground" disabled={saving}>
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Saved ✓</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save Configuration"}</span>
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

      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground">Loading sections...</div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`rounded-xl border p-5 transition-all ${
                section.isEnabled
                  ? "border-border bg-surface shadow-sm"
                  : "border-border/40 bg-surface/30 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-secondary font-mono text-xs font-bold text-accent">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-mono uppercase text-muted-foreground">
                      {section.sectionKey}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {section.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, "up")}
                      className="rounded p-1 text-muted-foreground hover:bg-surface-secondary disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      className="rounded p-1 text-muted-foreground hover:bg-surface-secondary disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-border mx-1" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {section.isEnabled ? "Visible" : "Hidden"}
                    </span>
                    <Switch
                      checked={section.isEnabled}
                      onCheckedChange={(checked) => handleToggle(section.id, checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">Section Heading Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => handleTitleChange(section.id, e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Section Subtitle</Label>
                  <Input
                    value={section.subtitle || ""}
                    onChange={(e) => handleSubtitleChange(section.id, e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
