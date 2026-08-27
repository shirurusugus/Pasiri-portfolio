"use client";

import React, { useState } from "react";
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // Bot trap
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) {
      // Silent discard for bots
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "", honeypot: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-12 border-b border-border/60 pb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Get in Touch
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed max-w-2xl">
          Have a project in mind, interested in design engineering consulting, or just want to connect? Send a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-start">
        {/* Left Column: Direct Info & Social Links */}
        <div className="md:col-span-5 space-y-8 rounded-2xl border border-border/80 bg-surface/30 p-6 sm:p-8 backdrop-blur-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Direct Contact
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:pasiri@example.com" className="text-foreground hover:underline">
                  pasiri@example.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Bangkok, Thailand (UTC+7)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Online Profiles
            </h3>
            <div className="flex flex-col space-y-2 text-xs">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub Repository</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn Profile</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter / X</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Accessible Form */}
        <div className="md:col-span-7 rounded-2xl border border-border/80 bg-surface/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
          {status === "success" ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
              <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
              <h2 className="text-xl font-semibold text-foreground">Message Sent Successfully</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out! I've received your note and will get back to you shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setStatus("idle")}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bot Honeypot */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Your Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={status === "submitting"}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs">Subject</Label>
                <Input
                  id="subject"
                  required
                  placeholder="Design Engineering Inquiry / Collaboration"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={status === "submitting"}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell me a bit about your project or inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={status === "submitting"}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full gap-2 font-medium"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
