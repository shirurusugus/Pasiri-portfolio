import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PASIRI — Portfolio & Case Studies",
    template: "%s | PASIRI",
  },
  description:
    "A carefully designed personal digital home, product design portfolio, activities, and design case studies of PASIRI.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "PASIRI",
    "software engineer",
    "design technologist",
    "UX UI designer",
    "Next.js",
    "case studies",
    "portfolio",
  ],
  authors: [{ name: "PASIRI" }],
  creator: "PASIRI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "PASIRI — Portfolio & Case Studies",
    description:
      "A carefully designed personal digital home, product design portfolio, activities, and design case studies of PASIRI.",
    siteName: "PASIRI Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "PASIRI — Portfolio & Case Studies",
    description: "A carefully designed personal digital home, product design portfolio, and case studies.",
    creator: "@pasiri",
  },
  icons: {
    icon: [
      { url: "/logo-light.png", media: "(prefers-color-scheme: dark)" },
      { url: "/logo-dark.png", media: "(prefers-color-scheme: light)" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#100e0b] font-sans antialiased selection:bg-accent/30 selection:text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
