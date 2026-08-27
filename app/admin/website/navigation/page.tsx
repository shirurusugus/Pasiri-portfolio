"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Check, Menu as MenuIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  order: number;
  isEnabled: boolean;
}

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [newIsExternal, setNewIsExternal] = useState(false);

  const loadNav = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website/navigation");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNav();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newHref.trim()) return;

    try {
      const res = await fetch("/api/admin/website/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel.trim(),
          href: newHref.trim(),
          isExternal: newIsExternal,
          order: items.length + 1,
        }),
      });

      if (res.ok) {
        setNewLabel("");
        setNewHref("");
        setNewIsExternal(false);
        loadNav();
      }
    } catch (err) {
      alert("Failed to add navigation item");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/website/navigation?id=${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((item, i) => ({ ...item, order: i + 1 }));
    setItems(reordered);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/website/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Navigation Menu Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Reorder, customize labels, link targets, and visibility of header navigation items.
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
              <span>{saving ? "Saving..." : "Save Menu Order"}</span>
            </>
          )}
        </Button>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-accent" />
          <span>Add Custom Menu Link</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Menu Label</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Publications"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Target Route / URL</Label>
            <Input
              value={newHref}
              onChange={(e) => setNewHref(e.target.value)}
              placeholder="/publications or https://..."
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <Button type="submit" size="sm">
              Add Link
            </Button>
          </div>
        </div>
      </form>

      {/* Navigation List */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="p-4 border-b border-border/60 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          Active Menu Items ({items.length})
        </div>

        <div className="divide-y divide-border/60">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-4 gap-4 hover:bg-surface-secondary/20">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-secondary font-mono text-xs font-bold text-accent">
                  {idx + 1}
                </span>

                <div>
                  <div className="font-semibold text-sm text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.href}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, "up")}
                    className="rounded p-1 text-muted-foreground hover:bg-surface-secondary disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, "down")}
                    className="rounded p-1 text-muted-foreground hover:bg-surface-secondary disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-4 w-px bg-border mx-1" />

                <Switch
                  checked={item.isEnabled}
                  onCheckedChange={(checked) =>
                    setItems((prev) =>
                      prev.map((it) => (it.id === item.id ? { ...it, isEnabled: checked } : it))
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
