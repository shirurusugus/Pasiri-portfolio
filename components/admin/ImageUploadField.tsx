"use client";

import React, { useState } from "react";
import { Upload, Image as ImageIcon, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { compressImageIfNeeded, safeFetchJson } from "@/lib/image-compress";

interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  placeholder?: string;
  required?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  folder = "general",
  placeholder = "Image URL or upload from device",
  required = false,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploading(true);
    setError("");

    try {
      // Automatically compress client-side before uploading (reduces 10MB -> ~400KB)
      const file = await compressImageIfNeeded(rawFile);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await safeFetchJson(res);
      if (!res.ok) throw new Error(data.error || "Failed to upload file");

      if (data.media?.url) {
        onChange(data.media.url);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-xs font-medium text-foreground block">{label}</label>}

      {/* Preview Box */}
      {value ? (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-border bg-surface-secondary">
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-md bg-black/75 p-1.5 text-destructive hover:bg-destructive hover:text-white transition-colors"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary/30 p-4 text-center">
          <ImageIcon className="h-7 w-7 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">No image selected</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 p-2 text-xs text-destructive border border-destructive/30">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input + Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-xs flex-1 min-w-[140px]"
          required={required}
        />

        {/* Direct Local Computer File Upload */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleDirectUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-3 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors gap-1.5 shadow-sm">
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
              </>
            )}
          </div>
        </label>

        {/* Pick from Media Library Modal */}
        <MediaPickerModal
          onSelect={(m) => onChange(m.url)}
          trigger={
            <Button type="button" variant="outline" size="sm" className="h-9 px-3 text-xs border-border">
              Library
            </Button>
          }
        />
      </div>
    </div>
  );
}

export default ImageUploadField;
