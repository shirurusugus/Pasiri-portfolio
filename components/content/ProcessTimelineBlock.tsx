import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  stepNumber: string | number;
  title: string;
  description: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | null;
  quote?: string | null;
  linkUrl?: string | null;
}

export interface ProcessTimelineBlockProps {
  title?: string;
  subtitle?: string | null;
  steps: TimelineStep[];
  className?: string;
}

export function ProcessTimelineBlock({
  title = "กระบวนการทำงาน / Process",
  subtitle,
  steps = [],
  className,
}: ProcessTimelineBlockProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section
      className={cn(
        "my-12 rounded-xl border border-border/80 bg-surface/50 p-6 sm:p-8 backdrop-blur-sm",
        className
      )}
      aria-label={title}
    >
      {/* Header */}
      <div className="mb-8 border-b border-border/60 pb-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Step Sequence */}
      <div className="relative space-y-8">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const formattedNumber =
            typeof step.stepNumber === "number"
              ? String(step.stepNumber).padStart(2, "0")
              : String(step.stepNumber || idx + 1).padStart(2, "0");

          return (
            <div key={idx} className="relative flex gap-4 sm:gap-6 group">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className="absolute left-4 top-9 -bottom-8 w-[1px] bg-border/80 group-hover:bg-accent/40 transition-colors sm:left-5"
                  aria-hidden="true"
                />
              )}

              {/* Number Anchor */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-xs font-mono font-semibold text-accent shadow-sm sm:h-10 sm:w-10 sm:text-sm">
                {formattedNumber}
              </div>

              {/* Step Content Body */}
              <div className="flex-1 pt-0.5 space-y-2">
                <h4 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {step.title}
                </h4>

                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {step.description}
                </p>

                {/* Optional Quote Callout */}
                {step.quote && (
                  <div className="mt-3 border-l-2 border-accent/60 pl-3.5 py-1 text-xs sm:text-sm italic text-foreground/90 bg-surface/80 rounded-r-md">
                    "{step.quote}"
                  </div>
                )}

                {/* Optional Media (Image / Video) */}
                {step.mediaUrl && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-border bg-black/20">
                    {step.mediaType === "video" ? (
                      <video
                        src={step.mediaUrl}
                        controls
                        className="max-h-[360px] w-full object-cover"
                      />
                    ) : (
                      <div className="relative h-48 w-full sm:h-64">
                        <Image
                          src={step.mediaUrl}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Link */}
                {step.linkUrl && (
                  <div className="pt-2">
                    <a
                      href={step.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <span>Explore step resource</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
