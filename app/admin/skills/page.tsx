"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, FolderPlus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface SkillCategory {
  id: string;
  name: string;
  order: number;
  skills: { id: string; name: string; isFeatured: boolean; order: number }[];
}

export default function AdminSkillsPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !selectedCatId) {
          setSelectedCatId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !selectedCatId) return;

    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkillName.trim(),
          categoryId: selectedCatId,
          isFeatured,
        }),
      });

      if (res.ok) {
        setNewSkillName("");
        setIsFeatured(false);
        loadSkills();
      }
    } catch (err) {
      alert("Failed to add skill");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_category",
          categoryName: newCategoryName.trim(),
          order: categories.length + 1,
        }),
      });

      if (res.ok) {
        setNewCategoryName("");
        loadSkills();
      }
    } catch (err) {
      alert("Failed to add category");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/skills?skillId=${id}`, { method: "DELETE" });
      if (res.ok) loadSkills();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Skills & Tooling Matrix
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize core competencies by category (no fake percentage bars).
          </p>
        </div>
      </div>

      {/* Quick Add Forms */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Add Skill */}
        <form onSubmit={handleAddSkill} className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-accent" />
            <span>Add New Skill</span>
          </h3>

          <div className="space-y-1.5">
            <Label className="text-xs">Skill Name</Label>
            <Input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Next.js 15, WebGL, WCAG 2.2"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={selectedCatId} onValueChange={setSelectedCatId}>
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

          <div className="flex items-center justify-between rounded-lg border border-border p-2">
            <span className="text-xs">Featured on Homepage</span>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          <Button type="submit" size="sm" className="w-full">
            Add Skill
          </Button>
        </form>

        {/* Add Category */}
        <form onSubmit={handleAddCategory} className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <FolderPlus className="h-4 w-4 text-accent" />
            <span>Create Skill Category</span>
          </h3>

          <div className="space-y-1.5">
            <Label className="text-xs">Category Name</Label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Artificial Intelligence, Cloud"
              required
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            Categories group skills neatly on the public /skills page.
          </p>

          <Button type="submit" variant="outline" size="sm" className="w-full border-border">
            Create Category
          </Button>
        </form>
      </div>

      {/* Existing Grouped Skills */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Existing Categories & Skills ({categories.length})
        </h2>

        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="font-semibold text-sm text-foreground">{cat.name}</h3>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {cat.skills.length} skills
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {cat.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2 rounded-md border border-border/80 bg-surface-secondary/50 px-2.5 py-1 text-xs text-foreground group"
                  >
                    <span>{skill.name}</span>
                    {skill.isFeatured && (
                      <span className="text-[10px] text-accent font-mono">★</span>
                    )}
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
