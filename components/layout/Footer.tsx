import React from "react";
import Link from "next/link";
import { ArrowUpRight, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface FooterProps {
  description?: string;
  socialLinks?: {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    email?: string | null;
  };
}

export function Footer({
  description = "A carefully designed personal digital home, engineering portfolio, and case studies.",
  socialLinks = {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    email: "pasiri@example.com",
  },
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border/40 bg-surface/30 backdrop-blur-sm mt-24">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo size="md" href="/" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              {description}
            </p>
            <div className="pt-2 flex items-center gap-3">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinks.email && (
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-secondary hover:text-foreground"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Col 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/activities"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Activities & Events
                </Link>
              </li>
              <li>
                <Link
                  href="/certifications"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Awards & Certificates
                </Link>
              </li>
              <li>
                <Link
                  href="/digital-art"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Digital Art & Painting
                </Link>
              </li>
              <li>
                <Link
                  href="/write-ups"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Write-ups & Research
                </Link>
              </li>
              <li>
                <Link
                  href="/resume"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resume & Experience
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Selected Highlights
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/activities/global-game-jam-2026"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Global Game Jam 2026
                </Link>
              </li>
              <li>
                <Link
                  href="/activities/service-design-bootcamp-2026"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Service Design Bootcamp
                </Link>
              </li>
              <li>
                <Link
                  href="/activities/wedo-hci-lab-scg"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  WEDO HCI Lab × SCG
                </Link>
              </li>
              <li>
                <Link
                  href="/activities/vokabloom"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Vokabloom Case Study
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Admin & Direct
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>CMS Portal</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border/40 pt-6 sm:flex-row text-xs text-muted-foreground">
          <p>© {currentYear} PASIRI. Crafted with care and accessibility.</p>
          <p className="mt-2 sm:mt-0 text-[11px]">
            Designed with Smokeveil Aura System
          </p>
        </div>
      </div>
    </footer>
  );
}
