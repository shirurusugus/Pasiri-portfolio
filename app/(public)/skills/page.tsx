import React from "react";
import Link from "next/link";
import { Sparkles, Terminal, Code2, Database, Layout, Wrench } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Skills & Tooling",
  description: "Categorized technologies, design tools, and engineering proficiencies of pasiri.",
};

export const revalidate = 60;

export default async function SkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      skills: {
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-12 border-b border-border/60 pb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Skills & Tooling
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed max-w-2xl">
          Core technical competencies, frontend frameworks, design disciplines, and daily toolchains.
        </p>
      </div>

      {/* Grouped Categorized Lists (NO fake percentage bars) */}
      <div className="space-y-10">
        {categories.map((category) => (
          <section
            key={category.id}
            className="rounded-2xl border border-border/70 bg-surface/30 p-6 sm:p-8 backdrop-blur-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {category.name}
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {category.skills.length} competencies
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {category.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="group flex items-center gap-2 rounded-lg border border-border/80 bg-surface px-3.5 py-2 text-xs text-foreground transition-all hover:border-accent/50 hover:bg-surface-secondary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60 group-hover:bg-accent transition-colors" />
                  <span className="font-medium">{skill.name}</span>
                  {skill.isFeatured && (
                    <span className="text-[10px] text-accent font-mono uppercase">★</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-border/60 pt-8 flex items-center justify-between">
        <Link href="/experience" className="text-xs font-medium text-accent hover:underline">
          ← View Experience History
        </Link>
        <Link href="/certifications" className="text-xs font-medium text-accent hover:underline">
          View Certifications →
        </Link>
      </div>
    </div>
  );
}
