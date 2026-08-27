"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Briefcase, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  present: boolean;
  description: string;
  tags?: string | null;
  linkUrl?: string | null;
  order: number;
  isVisible: boolean;
}

export default function AdminExperiencePage() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    location: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    present: false,
    description: "",
    tags: "",
    linkUrl: "",
    order: 0,
    isVisible: true,
  });

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/experience");
      if (res.ok) {
        const data = await res.json();
        setItems(data.experiences || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      organization: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      present: false,
      description: "",
      tags: "",
      linkUrl: "",
      order: items.length + 1,
      isVisible: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ExperienceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      organization: item.organization,
      location: item.location || "",
      startDate: new Date(item.startDate).toISOString().split("T")[0],
      endDate: item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      present: item.present,
      description: item.description,
      tags: item.tags || "",
      linkUrl: item.linkUrl || "",
      order: item.order,
      isVisible: item.isVisible,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const method = editingItem ? "PUT" : "POST";
      const payload = editingItem ? { ...formData, id: editingItem.id } : formData;

      const res = await fetch("/api/admin/experience", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setModalOpen(false);
      loadExperiences();
    } catch (err: any) {
      setError(err.message || "Failed to save experience");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Experience History
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your itemized career history, titles, organizations, and timeline order.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenNew} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Experience</span>
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
          <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-base font-semibold">No experience records</h2>
          <Button size="sm" onClick={handleOpenNew}>Add First Role</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-secondary/50 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Role & Organization</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Visible</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{item.order}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="text-[11px] text-accent font-medium">
                        {item.organization} {item.location && `• ${item.location}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {formatDate(item.startDate, { month: "short", year: "numeric" })} —{" "}
                      {item.present ? "Present" : formatDate(item.endDate, { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {item.isVisible ? (
                        <span className="text-accent font-semibold text-[11px]">Active</span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg border-border bg-surface">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Experience" : "Add Experience Role"}</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Role Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Organization</Label>
                <Input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Studio Synapse"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bangkok, Thailand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  disabled={formData.present}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <span className="text-xs">Currently working here (Present)</span>
              <Switch
                checked={formData.present}
                onCheckedChange={(checked) => setFormData({ ...formData, present: checked })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Role Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key accomplishments and engineering responsibilities..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Next.js, TypeScript, Tailwind"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Display Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Experience
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
