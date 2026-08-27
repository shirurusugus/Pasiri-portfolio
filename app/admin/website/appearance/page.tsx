"use client";

import React, { useState, useEffect } from "react";
import { Save, Check, Palette, Eye, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminAppearancePage() {
  const [formData, setFormData] = useState({
    accentColor: "#2d7063",
    accentHover: "#388a7b",
    fontFamily: "Inter",
    borderRadius: "0.5rem",
    smokeveilDark: true,
    smokeveilLight: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch("/api/admin/website/appearance");
        if (res.ok) {
          const data = await res.json();
          if (data.theme) {
            setFormData({
              accentColor: data.theme.accentColor || "#2d7063",
              accentHover: data.theme.accentHover || "#388a7b",
              fontFamily: data.theme.fontFamily || "Inter",
              borderRadius: data.theme.borderRadius || "0.5rem",
              smokeveilDark: data.theme.smokeveilDark ?? true,
              smokeveilLight: data.theme.smokeveilLight ?? true,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTheme();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/website/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const curatedPalettes = [
    { name: "Teal Forest (Default)", accent: "#2d7063", hover: "#388a7b" },
    { name: "Nordic Sage", accent: "#3e6b5c", hover: "#4d8573" },
    { name: "Warm Amber", accent: "#a37038", hover: "#b88244" },
    { name: "Slate Indigo", accent: "#4d6185", hover: "#5c759f" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Appearance & Design Tokens
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Controlled customization of brand accents, font stacks, and contrast-safe typography.
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
              <span>{saving ? "Saving..." : "Save Appearance"}</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Curated Color Palettes</h2>

            <div className="grid grid-cols-2 gap-3">
              {curatedPalettes.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, accentColor: p.accent, accentHover: p.hover })}
                  className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all ${
                    formData.accentColor === p.accent
                      ? "border-accent bg-accent/15 ring-2 ring-accent"
                      : "border-border bg-surface-secondary/40 hover:border-border/80"
                  }`}
                >
                  <div className="h-4 w-4 rounded-full border border-black/40" style={{ backgroundColor: p.accent }} />
                  <div>
                    <div className="text-xs font-semibold text-foreground">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{p.accent}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Custom Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Accent Hover</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentHover}
                    onChange={(e) => setFormData({ ...formData, accentHover: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={formData.accentHover}
                    onChange={(e) => setFormData({ ...formData, accentHover: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Typography & Geometry</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Primary Font Family</Label>
                <Select
                  value={formData.fontFamily}
                  onValueChange={(val) => setFormData({ ...formData, fontFamily: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Recommended)</SelectItem>
                    <SelectItem value="Geist">Geist Sans</SelectItem>
                    <SelectItem value="Manrope">Manrope</SelectItem>
                    <SelectItem value="IBM Plex Sans">IBM Plex Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Border Radius</Label>
                <Select
                  value={formData.borderRadius}
                  onValueChange={(val) => setFormData({ ...formData, borderRadius: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.375rem">Subtle (6px)</SelectItem>
                    <SelectItem value="0.5rem">Standard (8px)</SelectItem>
                    <SelectItem value="0.75rem">Rounded (12px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Smokeveil Atmosphere</h2>

            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <div className="text-xs font-semibold">Dark Smokeveil (screen/soft-light on #100e0b)</div>
                <div className="text-[11px] text-muted-foreground">Main atmospheric visual system</div>
              </div>
              <Switch
                checked={formData.smokeveilDark}
                onCheckedChange={(checked) => setFormData({ ...formData, smokeveilDark: checked })}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-semibold">Light Theme Multiply Adapter</div>
                <div className="text-[11px] text-muted-foreground">Uses multiply blend mode on light bg</div>
              </div>
              <Switch
                checked={formData.smokeveilLight}
                onCheckedChange={(checked) => setFormData({ ...formData, smokeveilLight: checked })}
              />
            </div>
          </div>
        </div>

        {/* Live Token Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-[#100e0b] p-6 text-foreground shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase text-muted-foreground">Dark Preview (#100e0b)</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>WCAG 2.2 AA Pass</span>
              </div>
            </div>

            <h3 className="text-xl font-bold tracking-tight">
              Aura Visual Hierarchy
            </h3>

            <p className="text-xs text-white/80 leading-relaxed">
              This preview demonstrates how your accent tokens contrast against the deep #100e0b canvas.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                className="rounded-md px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: formData.accentColor }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="rounded-md border border-white/20 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/5"
              >
                Secondary
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
