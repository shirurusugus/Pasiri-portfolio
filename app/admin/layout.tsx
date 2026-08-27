import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Admin Dashboard | pasiri CMS",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
