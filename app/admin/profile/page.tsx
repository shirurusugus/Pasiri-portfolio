"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Save,
  Check,
  User,
  MapPin,
  Mail,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  FileText,
  Upload,
  ExternalLink,
  Loader2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default function AdminProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    headline: "",
    bio: "",
    philosophy: "",
    currentFocus: "",
    interests: "",
    avatarUrl: "",
    resumeUrl: "",
    email: "",
    githubUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    location: "",
    availableFor: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadMsg, setResumeUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Educations State
  const [educations, setEducations] = useState<any[]>([]);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<any | null>(null);
  const [eduForm, setEduForm] = useState({
    institution: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
  });

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setFormData({
            fullName: data.profile.fullName || "",
            headline: data.profile.headline || "",
            bio: data.profile.bio || "",
            philosophy: data.profile.philosophy || "",
            currentFocus: data.profile.currentFocus || "",
            interests: data.profile.interests || "",
            avatarUrl: data.profile.avatarUrl || "",
            resumeUrl: data.profile.resumeUrl || "",
            email: data.profile.email || "",
            githubUrl: data.profile.githubUrl || "",
            linkedinUrl: data.profile.linkedinUrl || "",
            twitterUrl: data.profile.twitterUrl || "",
            websiteUrl: data.profile.websiteUrl || "",
            location: data.profile.location || "",
            availableFor: data.profile.availableFor || "",
          });
          if (data.profile.educations) {
            setEducations(data.profile.educations);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setResumeUploadMsg({ type: "error", text: "Please upload a valid PDF document (.pdf)" });
      return;
    }

    setUploadingResume(true);
    setResumeUploadMsg(null);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/profile/resume", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload resume PDF");

      setFormData((prev) => ({ ...prev, resumeUrl: json.url }));
      setResumeUploadMsg({ type: "success", text: `Uploaded ${file.name} successfully!` });
    } catch (err: any) {
      setResumeUploadMsg({ type: "error", text: err.message || "Upload failed." });
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const handleOpenNewEdu = () => {
    setEditingEdu(null);
    setEduForm({
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
    });
    setEduModalOpen(true);
  };

  const handleOpenEditEdu = (edu: any) => {
    setEditingEdu(edu);
    setEduForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      location: edu.location || "",
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : "",
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : "",
      current: edu.current || false,
    });
    setEduModalOpen(true);
  };

  const handleDeleteEdu = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education entry?")) return;
    try {
      const res = await fetch(`/api/admin/education?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEducations((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      alert("Failed to delete education");
    }
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...eduForm,
        order: editingEdu ? editingEdu.order : educations.length,
      };

      const res = await fetch("/api/admin/education", {
        method: editingEdu ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEdu ? { ...payload, id: editingEdu.id } : payload),
      });

      if (res.ok) {
        setEduModalOpen(false);
        loadProfile();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save education");
      }
    } catch (err) {
      alert("Failed to save education");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-muted-foreground">Loading profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Profile & Personal Brand
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your biography, engineering philosophy, avatar, and public contact links.
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
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Core Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Core Identity</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name / Brand</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

            <div className="space-y-1.5">
              <Label className="text-xs">Headline</Label>
              <Input
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Software Engineer & Digital Product Designer"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Short Biography</Label>
              <Textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Your primary narrative introduction..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Availability Status Badge</Label>
              <Input
                value={formData.availableFor}
                onChange={(e) => setFormData({ ...formData, availableFor: e.target.value })}
                placeholder="Available for selected consulting & design engineering"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Editorial Philosophy & Focus</h2>

            <div className="space-y-1.5">
              <Label className="text-xs">Design & Engineering Philosophy</Label>
              <Textarea
                rows={3}
                value={formData.philosophy}
                onChange={(e) => setFormData({ ...formData, philosophy: e.target.value })}
                placeholder="Your core principles on software craft, typography, and human focus..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Current Focus</Label>
              <Textarea
                rows={2}
                value={formData.currentFocus}
                onChange={(e) => setFormData({ ...formData, currentFocus: e.target.value })}
                placeholder="Topics and technologies you are currently researching or developing..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Interests & Hobbies</Label>
              <Input
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="Typography, pour-over coffee, indie games..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Avatar, Resume, Socials */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profile Photo / Avatar
            </h3>

            <ImageUploadField
              value={formData.avatarUrl}
              onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
              folder="profile"
              placeholder="Avatar URL or upload photo"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Resume & CV Document</span>
            </h3>

            {/* Hidden File Input for PDF */}
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleResumeUpload}
            />

            {/* Upload Action Button */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingResume}
                className="w-full rounded-lg gap-2 border-dashed border-border/80 hover:border-accent hover:bg-accent/5 py-5 text-xs"
                onClick={() => resumeInputRef.current?.click()}
              >
                {uploadingResume ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span>Uploading resume.pdf...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-accent" />
                    <span>Upload Resume PDF (.pdf)</span>
                  </>
                )}
              </Button>

              {resumeUploadMsg && (
                <div
                  className={`flex items-center gap-2 rounded-md p-2.5 text-xs ${
                    resumeUploadMsg.type === "success"
                      ? "bg-accent/10 border border-accent/30 text-accent"
                      : "bg-destructive/10 border border-destructive/30 text-destructive"
                  }`}
                >
                  {resumeUploadMsg.type === "success" ? (
                    <FileCheck className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{resumeUploadMsg.text}</span>
                </div>
              )}

              {/* Current PDF file display / management */}
              {formData.resumeUrl && formData.resumeUrl !== "/resume" && (
                <div className="rounded-lg border border-border/80 bg-surface-secondary/40 p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="rounded bg-accent/10 p-1.5 text-accent shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {formData.resumeUrl.split("/").pop() || "Resume.pdf"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {formData.resumeUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      <a href={formData.resumeUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setFormData((prev) => ({ ...prev, resumeUrl: "" }))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] text-muted-foreground">Or Direct URL / Custom Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.resumeUrl}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    placeholder="/uploads/resume.pdf or https://..."
                    className="text-xs font-mono h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaModalOpen(true)}
                    className="shrink-0 text-xs gap-1 h-8"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>Library</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This file is used when visitors click "Download PDF Resume" on the public /resume page.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Social Connections
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Contact Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="pasiri@example.com"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">GitHub Profile</Label>
              <Input
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">LinkedIn Profile</Label>
              <Input
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Twitter / X</Label>
              <Input
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/..."
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Education Management Section */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-accent" />
              <span>Education & Degrees</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage degrees and universities shown in the Education section on /resume.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenNewEdu}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Education</span>
          </Button>
        </div>

        {educations.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            No education entries added yet. Click "Add Education" to add your degrees.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {educations.map((edu) => (
              <div key={edu.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-semibold text-foreground">
                    {edu.degree} in {edu.field}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {edu.institution} {edu.location && `• ${edu.location}`} •{" "}
                    {new Date(edu.startDate).getFullYear()} —{" "}
                    {edu.current ? "Present" : edu.endDate ? new Date(edu.endDate).getFullYear() : "—"}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => handleOpenEditEdu(edu)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteEdu(edu.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        onSelect={(media) => {
          setFormData((prev) => ({ ...prev, resumeUrl: media.url }));
          setMediaModalOpen(false);
        }}
      />

      {/* Education Dialog */}
      <Dialog open={eduModalOpen} onOpenChange={setEduModalOpen}>
        <DialogContent className="max-w-md border-border bg-surface">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingEdu ? "Edit Education" : "Add Education"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEdu} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs">Institution / University</Label>
              <Input
                value={eduForm.institution}
                onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                placeholder="e.g. Chulalongkorn University"
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Degree</Label>
                <Input
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Science"
                  required
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Field of Study</Label>
                <Input
                  value={eduForm.field}
                  onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })}
                  placeholder="e.g. Computer Science"
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Location (Optional)</Label>
              <Input
                value={eduForm.location}
                onChange={(e) => setEduForm({ ...eduForm, location: e.target.value })}
                placeholder="e.g. Bangkok, Thailand"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={eduForm.startDate}
                  onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={eduForm.endDate}
                  onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                  disabled={eduForm.current}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="current-edu"
                checked={eduForm.current}
                onCheckedChange={(checked) => setEduForm({ ...eduForm, current: checked })}
              />
              <Label htmlFor="current-edu" className="text-xs font-normal cursor-pointer">
                Currently studying here
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEduModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}
