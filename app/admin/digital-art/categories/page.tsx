"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";

interface ArtworkCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: { artworks: number };
}

export default function AdminArtworkCategoriesPage() {
  const [categories, setCategories] = useState<ArtworkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/artworks/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setNewName(val);
    if (!newSlug || newSlug === slugify(newName)) {
      setNewSlug(slugify(val));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug) return;
    setError("");

    try {
      const res = await fetch("/api/admin/artworks/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          order: newOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      setNewName("");
      setNewSlug("");
      setNewOrder(categories.length + 1);
      loadCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Artworks in this category will become unassigned.`)) return;

    try {
      const res = await fetch(`/api/admin/artworks/categories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) loadCategories();
    } catch (e) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Link href="/admin/digital-art">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Artwork Categories
          </h1>
          <p className="text-xs text-muted-foreground">
            Create and organize digital art categories (e.g. Digital Painting, Concept Art, Character Design).
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Category Card */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent" />
          <span>Add New Category</span>
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end">
          <div className="sm:col-span-4 space-y-1">
            <Label className="text-xs">Category Name</Label>
            <Input
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Matte Painting"
              className="text-xs"
              required
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <Label className="text-xs">URL Slug</Label>
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="matte-painting"
              className="text-xs font-mono"
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs">Order</Label>
            <Input
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(parseInt(e.target.value) || 0)}
              className="text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" size="sm" className="w-full text-xs bg-accent text-accent-foreground">
              Create
            </Button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Existing Categories ({categories.length})
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">No categories defined yet.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 hover:bg-surface-secondary/40 transition-colors text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{cat.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">/{cat.slug}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {cat._count?.artworks || 0} artwork(s) assigned • Order #{cat.order}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
