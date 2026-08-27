"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Search, Check, Copy, Trash2, X, Plus, AlertCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { compressImageIfNeeded, safeFetchJson } from "@/lib/image-compress";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";

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

interface MediaPickerModalProps {
  onSelect: (media: MediaItem) => void;
  trigger?: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MediaPickerModal({
  onSelect,
  trigger,
  title = "Select from Media Library",
  isOpen: propIsOpen,
  open: propOpen,
  onOpenChange: setControlledOpen,
}: MediaPickerModalProps) {
  const controlledOpen = propIsOpen !== undefined ? propIsOpen : propOpen;
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [uploadError, setUploadError] = useState("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder && folder !== "all") params.append("folder", folder);
      if (query) params.append("q", query);

      const res = await fetch(`/api/media?${params.toString()}`);
      if (res.ok) {
        const data = await safeFetchJson(res);
        setItems(data.items || data.media || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, folder, query]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const optimizedFile = await compressImageIfNeeded(files[i]);

        const formData = new FormData();
        formData.append("file", optimizedFile);
        formData.append("folder", folder === "all" ? "general" : folder);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await safeFetchJson(res);
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }

      await fetchMedia();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 border-border bg-surface">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border/60">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename or alt text..."
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="inline-flex h-8 items-center justify-center rounded-md bg-accent px-3 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                <span>{uploading ? "Uploading..." : "Upload New"}</span>
              </div>
            </label>
          </div>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive border border-destructive/30 my-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px] py-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              Loading library...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
              <p className="text-sm font-medium text-foreground">No media assets found</p>
              <p className="text-xs text-muted-foreground">Upload images or videos to build your asset library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isImage = item.mimeType.startsWith("image/");

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative cursor-pointer rounded-lg border overflow-hidden p-1 transition-all ${
                      isSelected
                        ? "border-accent bg-accent/15 ring-2 ring-accent"
                        : "border-border bg-surface-secondary/40 hover:border-border/80"
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden rounded bg-black/20">
                      {isImage ? (
                        <>
                          <Image
                            src={item.url}
                            alt={item.altText || item.originalName}
                            fill
                            className="object-cover"
                          />
                          {/* Eye / Zoom Preview Button */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewItem(item);
                              }}
                              className="rounded-full bg-black/75 p-1.5 text-white hover:bg-black hover:scale-110 transition-all shadow-md"
                              title="Preview full-size image"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-mono text-muted-foreground uppercase">
                          {item.mimeType.split("/")[1] || "FILE"}
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="pt-1.5 px-1">
                      <p className="text-[11px] font-medium text-foreground truncate" title={item.originalName}>
                        {item.originalName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {(item.fileSize / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            {selectedItem ? `Selected: ${selectedItem.originalName}` : "Click an item to select"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedItem}
              onClick={handleConfirmSelect}
            >
              Insert Selected
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Full-screen Lightbox Preview */}
      {previewItem && (
        <ImageLightboxModal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          src={previewItem.url}
          title={previewItem.originalName}
          subtitle={`${(previewItem.fileSize / 1024).toFixed(0)} KB • Folder: ${previewItem.folder}`}
        />
      )}
    </Dialog>
  );
}
