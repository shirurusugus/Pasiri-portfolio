import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Globe, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeActions } from "@/components/public/ResumeActions";

export const metadata = {
  title: "Resume & Curriculum Vitae",
  description: "Curriculum vitae and professional background of pasiri.",
};

export const revalidate = 60;

export default async function ResumePage() {
  const [profile, experiences, skills, educations, certifications] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.experience.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
    prisma.skill.findMany({
      orderBy: { order: "asc" },
      include: { category: true },
    }),
    prisma.education.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.certification.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 animate-in fade-in duration-500 print:py-0 print:px-0 print:max-w-none">
      {/* Top Bar Actions */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <ResumeActions resumeUrl={profile?.resumeUrl} />
      </div>

      {/* Structured Clean Resume Document */}
      <div className="rounded-2xl border border-border/80 bg-surface/50 p-6 sm:p-12 shadow-md space-y-12 backdrop-blur-sm print:border-none print:shadow-none print:bg-transparent print:p-0 print:backdrop-blur-none">
        {/* Header Information */}
        <header className="space-y-4 border-b border-border/60 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {profile?.fullName || "pasiri"}
              </h1>
              <p className="text-base font-medium text-accent mt-1">
                {profile?.headline || "Design Engineer & Software Architect"}
              </p>
            </div>
            <div className="text-xs text-muted-foreground sm:text-right space-y-1">
              {profile?.location && (
                <div className="flex sm:justify-end items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex sm:justify-end items-center gap-1.5">
                  <Mail className="h-3 w-3 text-accent" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-2xl">
            {profile?.bio}
          </p>
        </header>

        {/* 1. Experience */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
            Professional Experience
          </h2>

          <div className="space-y-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {exp.title}
                    </h3>
                    <span className="text-xs text-accent font-medium">
                      {exp.organization} {exp.location && `• ${exp.location}`}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatDate(exp.startDate, { month: "short", year: "numeric" })} —{" "}
                    {exp.present ? "Present" : formatDate(exp.endDate, { month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  {exp.description}
                </p>
                {exp.tags && (
                  <p className="text-[11px] font-mono text-muted-foreground pt-1">
                    Technologies: {exp.tags}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 2. Education */}
        {educations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
              Education
            </h2>
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {edu.degree} in {edu.field}
                    </h3>
                    <span className="text-xs text-accent font-medium">
                      {edu.institution} {edu.location && `• ${edu.location}`}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatDate(edu.startDate, { year: "numeric" })} —{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate, { year: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Skills */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
            Core Competencies & Tools
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        {/* 4. Certifications */}
        {certifications.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
              Certifications & Credentials
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {certifications.map((c) => (
                <div key={c.id} className="rounded-lg border border-border/60 bg-surface/30 p-3 text-xs">
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    {c.issuer} • {formatDate(c.issueDate, { year: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
