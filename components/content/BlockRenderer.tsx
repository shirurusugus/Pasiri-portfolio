"use client";

import React from "react";
import Image from "next/image";
import { Check, Copy, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { ProcessTimelineBlock, TimelineStep } from "./ProcessTimelineBlock";
import { cn } from "@/lib/utils";

export interface ContentBlock {
  id?: string;
  type: string;
  order?: number;
  data: string | any;
}

interface BlockRendererProps {
  blocks?: ContentBlock[];
  rawContent?: string | null;
  className?: string;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border border-border bg-surface font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between border-b border-border bg-surface-secondary/50 px-4 py-2 text-muted-foreground">
        <span className="uppercase text-[11px] font-semibold">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-accent" />
              <span className="text-accent">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseBlockData(data: string | any) {
  if (typeof data === "object" && data !== null) return data;
  try {
    return JSON.parse(data);
  } catch {
    return { text: data };
  }
}

export function BlockRenderer({ blocks = [], rawContent, className }: BlockRendererProps) {
  const hasBlocks = blocks && blocks.length > 0;
  const hasRawContent = !!rawContent && rawContent.trim() !== "" && rawContent !== "<p></p>";

  if (!hasBlocks && !hasRawContent) {
    return null;
  }

  const sortedBlocks = hasBlocks
    ? [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  const timelineBlock = sortedBlocks.find((b) => b.type === "process_timeline");
  const otherBlocks = sortedBlocks.filter((b) => b.type !== "process_timeline");

  const timelineData = timelineBlock ? parseBlockData(timelineBlock.data) : null;
  const hasExternalTimeline = !!timelineData && Array.isArray(timelineData.steps) && timelineData.steps.length > 0;

  // Helper to parse embedded timeline node attributes
  const parseTimelineAttributes = (tagStr: string): { title: string; subtitle: string; steps: TimelineStep[] } | null => {
    try {
      const titleMatch = tagStr.match(/data-title=(?:"([^"]*)"|'([^']*)')/i);
      const subtitleMatch = tagStr.match(/data-subtitle=(?:"([^"]*)"|'([^']*)')/i);
      const stepsMatch = tagStr.match(/data-steps=(?:"([^"]*)"|'([^']*)')/i);

      const title = (titleMatch ? titleMatch[1] || titleMatch[2] : "") || "Process & Milestones";
      const subtitle = (subtitleMatch ? subtitleMatch[1] || subtitleMatch[2] : "") || "";

      let steps: TimelineStep[] = [];
      const stepsRaw = stepsMatch ? stepsMatch[1] || stepsMatch[2] : "";
      if (stepsRaw) {
        try {
          steps = JSON.parse(decodeURIComponent(stepsRaw));
        } catch {
          try {
            steps = JSON.parse(stepsRaw);
          } catch {
            const unescaped = stepsRaw
              .replace(/&quot;/g, '"')
              .replace(/&#34;/g, '"')
              .replace(/&amp;/g, "&");
            try {
              steps = JSON.parse(unescaped);
            } catch {}
          }
        }
      }

      return { title, subtitle, steps };
    } catch (err) {
      console.error("Error parsing timeline node:", err);
      return null;
    }
  };

  // Split rawContent into segments (HTML chunks and embedded timeline nodes)
  const embeddedTimelineSplitRegex = /(<div\s+[^>]*data-type=["']process-timeline["'][^>]*>[\s\S]*?<\/div>|<process-timeline[^>]*>[\s\S]*?<\/process-timeline>)/i;
  const isEmbeddedTimelineTag = (str: string) =>
    /<div\s+[^>]*data-type=["']process-timeline["']/i.test(str) ||
    /<process-timeline/i.test(str);

  // Check if rawContent has text marker [[timeline]]
  const timelineMarkerRegex = /(?:<p[^>]*>)?\s*(?:\[\[\s*(?:⏱️\s*)?Process\s*&\s*Milestones\s*Timeline(?:\s*Block)?\s*\]\]|\[\[timeline\]\]|\[timeline\]|&lsqb;&lsqb;timeline&rsqb;&rsqb;)\s*(?:<\/p>)?/gi;
  const hasInlineMarker = hasRawContent && hasExternalTimeline && timelineMarkerRegex.test(rawContent || "");

  // Render external standalone timeline component if configured
  const renderExternalTimeline = () => {
    if (!hasExternalTimeline) return null;
    return (
      <ProcessTimelineBlock
        title={timelineData.title}
        subtitle={timelineData.subtitle}
        steps={timelineData.steps as TimelineStep[]}
      />
    );
  };

  // Position preference for external timeline: "top" | "middle" | "bottom"
  const position = timelineData?.position || (hasInlineMarker ? "middle" : "bottom");

  // If inline marker exists for external timeline, replace marker with placeholder
  let processedContent = rawContent || "";

  // Parse segments for rawContent
  const rawSegments = processedContent ? processedContent.split(embeddedTimelineSplitRegex) : [];

  return (
    <div className={cn("space-y-10", className)}>
      {/* CASE 1: External Timeline placed at TOP */}
      {hasExternalTimeline && position === "top" && renderExternalTimeline()}

      {/* Render all HTML and embedded Timeline segments in exact flow order */}
      {rawSegments.map((segment, idx) => {
        if (!segment || segment.trim() === "" || segment.trim() === "<p></p>") {
          return null;
        }

        if (isEmbeddedTimelineTag(segment)) {
          const parsed = parseTimelineAttributes(segment);
          if (parsed && parsed.steps && parsed.steps.length > 0) {
            return (
              <ProcessTimelineBlock
                key={`embedded-timeline-${idx}`}
                title={parsed.title}
                subtitle={parsed.subtitle}
                steps={parsed.steps}
              />
            );
          }
          return null;
        }

        // If segment has [[timeline]] inline marker, handle splitting for external timeline
        if (hasInlineMarker && timelineMarkerRegex.test(segment)) {
          const markerParts = segment.split(timelineMarkerRegex);
          return (
            <React.Fragment key={`inline-marker-group-${idx}`}>
              {markerParts[0] && markerParts[0].trim() !== "" && (
                <div
                  className="prose-editorial text-foreground/90 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: markerParts[0] }}
                />
              )}
              {renderExternalTimeline()}
              {markerParts[1] && markerParts[1].trim() !== "" && (
                <div
                  className="prose-editorial text-foreground/90 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: markerParts[1] }}
                />
              )}
            </React.Fragment>
          );
        }

        return (
          <div
            key={`content-html-${idx}`}
            className="prose-editorial text-foreground/90 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: segment }}
          />
        );
      })}

      {/* CASE 2: External Timeline placed at BOTTOM (Default when no inline marker) */}
      {hasExternalTimeline && position === "bottom" && !hasInlineMarker && renderExternalTimeline()}

      {/* 2. Structured Blocks (Timeline, Images, Videos, Callouts, etc.) */}
      {hasBlocks && (
        <div className="space-y-8">
          {sortedBlocks.map((block, idx) => {
            const parsed = parseBlockData(block.data);

            switch (block.type) {
              case "heading": {
                const level = parsed.level || 2;
                const text = parsed.text || "";
                if (level === 1) {
                  return (
                    <h1 key={idx} className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-8 mb-4">
                      {text}
                    </h1>
                  );
                }
                if (level === 2) {
                  return (
                    <h2 key={idx} className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl mt-8 mb-4">
                      {text}
                    </h2>
                  );
                }
                return (
                  <h3 key={idx} className="text-lg font-semibold text-foreground mt-6 mb-3">
                    {text}
                  </h3>
                );
              }

              case "paragraph":
                return (
                  <p key={idx} className="text-base text-foreground/90 leading-relaxed">
                    {parsed.text}
                  </p>
                );

              case "quote":
                return (
                  <blockquote key={idx} className="my-6 border-l-2 border-accent pl-4 italic text-muted-foreground">
                    <p className="text-base font-normal text-foreground/90">"{parsed.quote || parsed.text}"</p>
                    {parsed.author && (
                      <footer className="mt-2 text-xs text-muted-foreground not-italic">— {parsed.author}</footer>
                    )}
                  </blockquote>
                );

              case "code":
                return <CodeBlock key={idx} code={parsed.code || parsed.text || ""} language={parsed.language} />;

              case "image":
                return (
                  <figure key={idx} className="my-8 overflow-hidden rounded-lg border border-border">
                    <div className="relative h-64 w-full sm:h-96">
                      <Image
                        src={parsed.url || parsed.src}
                        alt={parsed.alt || parsed.caption || "Content image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {parsed.caption && (
                      <figcaption className="bg-surface p-2.5 text-center text-xs text-muted-foreground">
                        {parsed.caption}
                      </figcaption>
                    )}
                  </figure>
                );

              case "video": {
                const url = parsed.url || "";
                const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
                let embedUrl = url;
                if (isYouTube) {
                  const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("/").pop();
                  embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                }

                return (
                  <div key={idx} className="my-8 overflow-hidden rounded-lg border border-border aspect-video">
                    {isYouTube ? (
                      <iframe
                        src={embedUrl}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={parsed.title || "Video player"}
                      />
                    ) : (
                      <video src={url} controls className="h-full w-full object-cover" />
                    )}
                  </div>
                );
              }

              case "callout":
                return (
                  <div
                    key={idx}
                    className="my-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm"
                  >
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div className="leading-relaxed text-foreground/90">{parsed.text || parsed.content}</div>
                  </div>
                );

              case "divider":
                return <hr key={idx} className="my-8 border-border" />;

              case "process_timeline":
                return (
                  <ProcessTimelineBlock
                    key={idx}
                    title={parsed.title}
                    subtitle={parsed.subtitle}
                    steps={parsed.steps as TimelineStep[]}
                  />
                );

              default:
                return (
                  <div key={idx} className="text-base text-foreground/90">
                    {parsed.text || JSON.stringify(parsed)}
                  </div>
                );
            }
          })}
        </div>
      )}
    </div>
  );
}
