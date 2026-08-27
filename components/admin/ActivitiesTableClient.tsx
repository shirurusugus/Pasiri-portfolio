"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Eye, Edit, Trash2, Sparkles, Check, AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  location?: string | null;
  eventDate: string | Date;
  status: string;
  featured: boolean;
  sortOrder: number;
}

interface ActivitiesTableClientProps {
  initialActivities: ActivityItem[];
}

export function ActivitiesTableClient({ initialActivities }: ActivitiesTableClientProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const featuredCount = activities.filter((a) => a.featured).length;

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setUpdatingId(id);
    const nextVal = !currentFeatured;

    // Optimistic UI update
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, featured: nextVal } : a))
    );

    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextVal }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (err) {
      // Revert if failed
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, featured: currentFeatured } : a))
      );
      alert("Failed to update featured status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Summary Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/20 text-accent font-bold">
            <Star className="h-3.5 w-3.5 fill-accent" />
          </span>
          <div>
            <span className="font-semibold text-foreground">
              รายการที่แสดงบนหน้า Home (หน้าแรก):
            </span>{" "}
            <span className="font-mono font-bold text-accent">
              {featuredCount} รายการ
            </span>{" "}
            <span className="text-muted-foreground">
              (ระบบจะนำ 3 รายการที่มีรูปดาว/Featured ขึ้นโชว์ในการ์ดไฮไลต์หน้า Home)
            </span>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
        >
          <span>ดูผลลัพธ์หน้า Home</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-secondary/50 font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Event Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">🌟 โชว์หน้าแรก (Home)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {activities.map((act) => (
                <tr
                  key={act.id}
                  data-admin-id={act.id}
                  data-admin-title={act.title}
                  data-admin-editable-type="activity"
                  data-admin-edit-url={`/admin/activities/${act.id}`}
                  data-admin-preview-url={`/activities/${act.slug}`}
                  data-admin-delete-url={`/api/admin/activities/${act.id}`}
                  data-admin-add-url="/admin/activities/new"
                  className={`hover:bg-surface-secondary/40 transition-colors cursor-context-menu ${
                    act.featured ? "bg-accent/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {act.sortOrder}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{act.title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {act.category} {act.location && `• ${act.location}`}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(act.eventDate)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={act.status === "PUBLISHED" ? "accent" : "secondary"}
                      className="text-[10px]"
                    >
                      {act.status}
                    </Badge>
                  </td>

                  {/* 1-Click Show on Home Toggle */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(act.id, act.featured)}
                        disabled={updatingId === act.id}
                        className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                          act.featured
                            ? "bg-accent text-accent-foreground font-bold shadow-sm ring-1 ring-accent/60 hover:brightness-110"
                            : "bg-surface-secondary/80 text-muted-foreground hover:bg-surface-secondary hover:text-foreground border border-border"
                        }`}
                        title="คลิกเพื่อเปิด/ปิดการแสดงผลกิจกรรมนี้บนหน้าแรก (Home Page)"
                      >
                        <Star
                          className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
                            act.featured ? "fill-accent-foreground" : "text-muted-foreground"
                          }`}
                        />
                        <span>{act.featured ? "โชว์หน้า Home ★" : "ไม่โชว์"}</span>
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Link href={`/activities/${act.slug}`} target="_blank" title="View Public Page">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Link href={`/admin/activities/${act.id}`} title="Edit Activity">
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
