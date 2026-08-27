"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Search, Copy, Check, Trash2, Filter, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  folder: string;
  altText?: string | null;
  caption?: string | null;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?folder=${folder}&q=${encodeURIComponent(query)}`);
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
    loadMedia();
  }, [folder, query]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("folder", folder === "all" ? "general" : folder);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }

      await loadMedia();
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert("Failed to delete media asset");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Media Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Upload, inspect, and organize image assets, screenshots, and diagrams for your articles and case studies.
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:bg-accent/90 shadow-sm transition-colors">
            <Upload className="mr-2 h-4 w-4" />
            <span>{uploading ? "Uploading Assets..." : "Upload New Media"}</span>
          </div>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by filename or title..."
            className="h-8 text-xs bg-background"
          />
        </div>

        {/* Folder Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          {["all", "projects", "activities", "blog", "general"].map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`rounded-md px-3 py-1 text-xs capitalize transition-colors ${
                folder === f
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "bg-surface-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground">
          Loading assets...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-surface/30 p-16 text-center space-y-3">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-base font-semibold text-foreground">No media assets found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Drag and drop images or click 'Upload New Media' to add assets to your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => {
            const isImage = item.mimeType.startsWith("image/");
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-accent/40 shadow-sm"
              >
                <div className="relative h-36 w-full bg-black/20 overflow-hidden">
                  {isImage ? (
                    <Image
                      src={item.url}
                      alt={item.altText || item.originalName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground uppercase">
                      {item.mimeType.split("/")[1] || "FILE"}
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(item.id, item.originalName)}
                      className="rounded-md bg-black/70 p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">
                      {item.folder}
                    </Badge>
                  </div>

                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface-secondary/60 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-surface-secondary"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-accent" />
                        <span className="text-accent">Copied URL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-muted-foreground" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
