import React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Calendar,
  FileText,
  Briefcase,
  Award,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0; // Dynamic on admin

export default async function AdminDashboardPage() {
  const [
    projectCount,
    activityCount,
    postCount,
    expCount,
    certCount,
    mediaCount,
    recentPosts,
    recentProjects,
    recentActivities,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.activity.count(),
    prisma.blogPost.count(),
    prisma.experience.count(),
    prisma.certification.count(),
    prisma.media.count(),
    prisma.blogPost.findMany({ take: 3, orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ take: 3, orderBy: { updatedAt: "desc" } }),
    prisma.activity.findMany({ take: 3, orderBy: { updatedAt: "desc" } }),
  ]);

  const metrics = [
    { label: "Projects", count: projectCount, href: "/admin/projects", icon: FolderGit2, color: "text-accent" },
    { label: "Activities", count: activityCount, href: "/admin/activities", icon: Calendar, color: "text-primary" },
    { label: "Blog Posts", count: postCount, href: "/admin/blog", icon: FileText, color: "text-amber-500" },
    { label: "Experience", count: expCount, href: "/admin/experience", icon: Briefcase, color: "text-blue-500" },
    { label: "Certifications", count: certCount, href: "/admin/certifications", icon: Award, color: "text-emerald-500" },
    { label: "Media Assets", count: mediaCount, href: "/admin/media", icon: ImageIcon, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, pasiri
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Overview of your portfolio content, case studies, and editorial articles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 text-xs">
            <Link href="/admin/projects/new">
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs border-border">
            <Link href="/admin/blog/new">
              <Plus className="h-3.5 w-3.5" />
              <span>New Article</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs border-border">
            <Link href="/admin/activities/new">
              <Plus className="h-3.5 w-3.5" />
              <span>New Activity</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40 hover:bg-surface-secondary/40"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-accent" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {m.count}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Content Lists */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Articles */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-accent" />
              <span>Recent Blog Posts</span>
            </div>
            <Link href="/admin/blog" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-foreground truncate group-hover:text-accent">
                      {post.title}
                    </span>
                    <Badge variant={post.status === "PUBLISHED" ? "accent" : "secondary"} className="text-[10px]">
                      {post.status}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Updated {formatDate(post.updatedAt)}
                  </span>
                </div>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FolderGit2 className="h-4 w-4 text-accent" />
              <span>Recent Projects</span>
            </div>
            <Link href="/admin/projects" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {recentProjects.map((proj) => (
              <div key={proj.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-foreground truncate group-hover:text-accent">
                      {proj.title}
                    </span>
                    <Badge variant={proj.status === "PUBLISHED" ? "accent" : "secondary"} className="text-[10px]">
                      {proj.status}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {proj.category} • Updated {formatDate(proj.updatedAt)}
                  </span>
                </div>
                <Link
                  href={`/admin/projects/${proj.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launchpad Guide */}
      <div className="rounded-xl border border-border/70 bg-surface-secondary/40 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Content Workflow Tips</span>
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Create Case Studies and Blog Posts with rich media and Process Timelines. You can save your work as a <strong>Draft</strong> anytime, preview it in real-time, and publish when you're ready. All changes are snapshot in the revision history for safe restoration.
        </p>
      </div>
    </div>
  );
}
