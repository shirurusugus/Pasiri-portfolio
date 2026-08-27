import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ActivityForm } from "@/components/admin/ActivityForm";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!activity) notFound();

  return <ActivityForm initialData={activity} isEditing={true} />;
}
