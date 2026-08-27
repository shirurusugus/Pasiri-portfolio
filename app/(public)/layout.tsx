import React from "react";
import { Smokeveil } from "@/components/backgrounds/Smokeveil";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuickEditContextMenu } from "@/components/admin/QuickEditContextMenu";
import { prisma } from "@/lib/db/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Query dynamic navigation items & profile settings from CMS database
  let navItems: any[] = [];
  let profile: any = null;

  try {
    const [dbNav, dbProfile] = await Promise.all([
      prisma.navigationItem.findMany({
        where: { isEnabled: true },
        orderBy: { order: "asc" },
      }),
      prisma.profile.findFirst(),
    ]);
    navItems = dbNav;
    profile = dbProfile;
  } catch (error) {
    console.error("Failed to load nav/profile from db:", error);
  }

  return (
    <Smokeveil>
      <Header navItems={navItems.length > 0 ? navItems : undefined} />
      <main className="flex-1">{children}</main>
      <Footer
        socialLinks={{
          github: profile?.githubUrl,
          linkedin: profile?.linkedinUrl,
          twitter: profile?.twitterUrl,
          email: profile?.email,
        }}
      />
    </Smokeveil>
  );
}
