import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchPexelsClips } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Film, RefreshCw, Upload, Loader2, Check, Image as ImageIcon } from "lucide-react";
import type { PexelsClip } from "@workspace/api-client-react";

export interface SelectedClip {
  url: string;
  kind: "pexels" | "upload" | "image";
  thumbnailUrl: string;
  label: string;
  durationSeconds: number;
}

interface SceneSlot {
  order: number;
  narration: string;
  keywords: string[];
  selected: SelectedClip | null;
  options: PexelsClip[];
}

export function ClipPicker({
  scenes,
  onChange,
}: {
  scenes: SceneSlot[];
  onChange: (next: SceneSlot[]) => void;
}) {
  const { toast } = useToast();
  const [refreshingScene, setRefreshingScene] = useState<number | null>(null);
  const [uploadingScene, setUploadingScene] = useState<number | null>(null);

  const search = useSearchPexelsClips();

  async function refreshScene(slot: SceneSlot) {
    if (slot.keywords.length === 0) return;
    setRefreshingScene(slot.order);
    try {
      const res = await search.mutateAsync({
        data: { keywords: slot.keywords, perKeyword: 3 },
      });
      const next = scenes.map((s) =>
        s.order === slot.order
          ? {
              ...s,
              options: res.clips,
              selected:
                res.clips.length > 0
                  ? {
                      url: res.clips[0].videoUrl,
                      kind: "pexels" as const,
                      thumbnailUrl: res.clips[0].thumbnailUrl,
                      label: res.clips[0].keyword,
                      durationSeconds: res.clips[0].durationSeconds,
                    }
                  : null,
            }
          : s,
      );
      onChange(next);
    } catch {
      toast({ title: "Could not fetch clips", description: "Please retry." });
    } finally {
      setRefreshingScene(null);
    }
  }

  function selectClip(slot: SceneSlot, clip: PexelsClip) {
    const next = scenes.map((s) =>
      s.order === slot.order
        ? {
            ...s,
            selected: {
              url: clip.videoUrl,
              kind: "pexels" as const,
              thumbnailUrl: clip.thumbnailUrl,
              label: clip.keyword,
              durationSeconds: clip.durationSeconds,
            },
          }
        : s,
    );
    onChange(next);
  }

  async function handleUpload(slot: SceneSlot, file: File) {
    setUploadingScene(slot.order);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch("/api/uploads", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!resp.ok) throw new Error("upload failed");
      const data = (await resp.json()) as {
        url: string;
        kind: "image" | "video";
        originalName: string;
      };
      const next = scenes.map((s) =>
        s.order === slot.order
          ? {
              ...s,
              selected: {
                url: data.url,
                kind: data.kind === "video" ? ("upload" as const) : ("image" as const),
                thumbnailUrl: data.url,
                label: data.originalName,
                durationSeconds: 0,
              },
            }
          : s,
      );
      onChange(next);
    } catch {
      toast({ title: "Upload failed", description: "JPG/PNG/WEBP/MP4 only, max 50MB." });
    } finally {
      setUploadingScene(null);
    }
  }

  return (
    <div className="space-y-4">
      {scenes.map((slot) => (
        <div key={slot.order} className="rounded-xl border border-border bg-background/40 p-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary">
                  Scene {slot.order}
                </span>
                <div className="flex flex-wrap gap-1">
                  {slot.keywords.map((k) => (
                    <Badge key={k} variant="secondary" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{slot.narration}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshScene(slot)}
                disabled={refreshingScene === slot.order}
                data-testid={`button-refresh-clips-${slot.order}`}
              >
                {refreshingScene === slot.order ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span className="text-xs">More</span>
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/mp4,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(slot, f);
                    e.target.value = "";
                  }}
                  data-testid={`input-upload-${slot.order}`}
                />
                <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
                  {uploadingScene === slot.order ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Upload
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {slot.options.map((c) => {
              const active = slot.selected?.url === c.videoUrl;
              return (
                <button
                  key={c.id}
                  onClick={() => selectClip(slot, c)}
                  className={cn(
                    "group relative aspect-video overflow-hidden rounded-lg border-2 transition-colors",
                    active ? "border-primary" : "border-transparent hover:border-primary/40",
                  )}
                  data-testid={`clip-option-${slot.order}-${c.id}`}
                >
                  <img
                    src={c.thumbnailUrl}
                    alt={c.keyword}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                    <span className="text-[10px] text-white truncate block">
                      {c.keyword} · {c.durationSeconds}s
                    </span>
                  </div>
                  {active && (
                    <div className="absolute top-1 right-1 grid place-items-center bg-primary text-primary-foreground rounded-full h-5 w-5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
            {slot.selected && (slot.selected.kind === "upload" || slot.selected.kind === "image") && (
              <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-primary">
                {slot.selected.kind === "image" ? (
                  <img
                    src={slot.selected.thumbnailUrl}
                    alt={slot.selected.label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={slot.selected.url}
                    className="h-full w-full object-cover"
                    muted
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                  <span className="text-[10px] text-white truncate block">
                    Upload · {slot.selected.label}
                  </span>
                </div>
                <div className="absolute top-1 right-1 grid place-items-center bg-primary text-primary-foreground rounded-full h-5 w-5">
                  <Check className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>

          {slot.options.length === 0 && !slot.selected && (
            <div className="text-xs text-muted-foreground py-3 flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5" />
              No clip yet. Tap "More" to fetch stock footage or "Upload" your own.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
