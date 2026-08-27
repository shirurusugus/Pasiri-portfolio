import React from "react";
import { prisma } from "@/lib/db/prisma";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  return <BlogForm categories={categories} isEditing={false} />;
}
