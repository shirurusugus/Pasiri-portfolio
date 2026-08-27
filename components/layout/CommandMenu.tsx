"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import {
  Search,
  FileText,
  FolderGit2,
  Calendar,
  Award,
  Sparkles,
  User,
  ArrowRight,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: string;
  title: string;
  category: string;
  href: string;
  type: "project" | "activity" | "blog" | "page" | "skill" | "cert";
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    let isMounted = true;
    async function fetchResults() {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setResults(data.items || []);
        }
      } catch (err) {
        console.error("Search fetch failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchResults, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [open, query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderGit2 className="h-4 w-4 text-accent" />;
      case "activity":
        return <Calendar className="h-4 w-4 text-primary" />;
      case "blog":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case "skill":
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      case "cert":
        return <Award className="h-4 w-4 text-emerald-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 rounded-md border border-border bg-surface/80 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Search portfolio and content (Press Ctrl + K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search pasiri...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="pointer-events-none ml-1 hidden rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-hover:text-foreground sm:inline-block border border-border/50">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-xl border-border bg-surface shadow-2xl">
          <div className="flex items-center border-b border-border px-3.5">
            <Search className="mr-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, activities, articles, skills..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto p-2">
            {loading && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {query ? `No matches found for "${query}"` : "Type something to search..."}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1">
                {results.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.href)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-secondary group"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <div>
                        <div className="font-medium group-hover:text-accent transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground capitalize">
                          {item.category || item.type}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-surface-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span>Navigate with keyboard</span>
            <span>ESC to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
