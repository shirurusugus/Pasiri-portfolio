"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Award, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { formatDate } from "@/lib/utils";

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  order: number;
  isVisible: boolean;
}

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<CertificationItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issueDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    credentialId: "",
    credentialUrl: "",
    imageUrl: "",
    order: 0,
    isVisible: true,
  });

  const loadCerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certifications");
      if (res.ok) {
        const data = await res.json();
        setItems(data.certs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCerts();
  }, []);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      issuer: "",
      issueDate: new Date().toISOString().split("T")[0],
      expirationDate: "",
      credentialId: "",
      credentialUrl: "",
      imageUrl: "",
      order: items.length + 1,
      isVisible: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CertificationItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      issuer: item.issuer,
      issueDate: new Date(item.issueDate).toISOString().split("T")[0],
      expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split("T")[0] : "",
      credentialId: item.credentialId || "",
      credentialUrl: item.credentialUrl || "",
      imageUrl: item.imageUrl || "",
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

      const res = await fetch("/api/admin/certifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setModalOpen(false);
      loadCerts();
    } catch (err: any) {
      setError(err.message || "Failed to save certification");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/certifications?id=${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Certifications Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage professional certificates, credential badges, and verification links.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenNew} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Certification</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
          <Award className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-base font-semibold">No certifications recorded</h2>
          <Button size="sm" onClick={handleOpenNew}>Add First Certification</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-secondary/50 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Certification & Issuer</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{item.order}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="text-[11px] text-accent font-medium">{item.issuer}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {formatDate(item.issueDate, { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {item.credentialId || "—"}
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
                          onClick={() => handleDelete(item.id, item.name)}
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
            <DialogTitle>{editingItem ? "Edit Certification" : "Add Certification"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Certification Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Meta Frontend Developer Certificate"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Issuer Organization</Label>
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g. Meta / Google / AWS"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Credential ID</Label>
              <Input
                value={formData.credentialId}
                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                placeholder="e.g. META-FE-998241"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Verification URL</Label>
              <Input
                value={formData.credentialUrl}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Badge / Certificate Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="URL or select from library"
                  className="text-xs"
                />
                <MediaPickerModal
                  onSelect={(m) => setFormData({ ...formData, imageUrl: m.url })}
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      Pick
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Certification
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
