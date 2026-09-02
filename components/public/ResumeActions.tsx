"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Printer, Upload, FileCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeActionsProps {
  resumeUrl?: string | null;
}

export function ResumeActions({ resumeUrl: initialResumeUrl }: ResumeActionsProps) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(
    initialResumeUrl && initialResumeUrl !== "/resume" && initialResumeUrl !== "#"
      ? initialResumeUrl
      : null
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is logged in as admin to show quick upload button
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setMessage({ type: "error", text: "กรุณาเลือกไฟล์เอกสาร PDF (.pdf) เท่านั้น" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/profile/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload resume PDF.");
      }

      setResumeUrl(data.url);
      setMessage({ type: "success", text: `อัปโหลด ${file.name} เรียบร้อยแล้ว!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาดในการอัปโหลด" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNoPdfClick = () => {
    setMessage({
      type: "error",
      text: "ยังไม่ได้อัปโหลดไฟล์ PDF คุณสามารถใช้ปุ่ม 'Print / Save as PDF' หรือล็อกอินเข้า CMS เพื่ออัปโหลดไฟล์ได้ครับ",
    });
    setTimeout(() => setMessage(null), 6000);
  };

  return (
    <div className="space-y-3 no-print">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Hidden File Input for PDF */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 1. Download Button */}
        {resumeUrl ? (
          <Button asChild size="sm" className="rounded-full gap-2 text-xs font-medium shadow-sm">
            <a href={resumeUrl} target="_blank" rel="noreferrer" download="Resume-Pasiri.pdf">
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF Resume</span>
            </a>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full gap-2 text-xs font-medium"
            onClick={handleNoPdfClick}
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Download PDF Resume</span>
          </Button>
        )}

        {/* 2. Print / Save as PDF via Browser */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full gap-2 text-xs font-medium"
          onClick={handlePrint}
          title="Print or Save as PDF cleanly formatted"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save as PDF</span>
        </Button>

        {/* 3. Quick Upload PDF (Visible when Admin or always accessible as shortcut) */}
        {isAdmin && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isUploading}
            className="rounded-full gap-2 text-xs font-medium border border-border"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-accent" />
                <span>{resumeUrl ? "Change PDF" : "Upload PDF"}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Status feedback message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-accent/10 border border-accent/30 text-accent font-medium"
              : "bg-destructive/10 border border-destructive/30 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <FileCheck className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
