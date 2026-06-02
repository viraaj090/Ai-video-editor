import { useEffect, useMemo, useRef, useState } from "react";
import { useListVoices } from "@workspace/api-client-react";
import type { Market } from "@/lib/markets";
import { Mic2, Loader2, Play, Pause, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoicePicker({
  market,
  selectedVoiceId,
  onSelect,
}: {
  market: Market;
  selectedVoiceId: string | null;
  onSelect: (voiceId: string, voiceName: string) => void;
}) {
  const { data, isLoading } = useListVoices({ market });
  const voices = useMemo(() => data?.voices ?? [], [data]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-pick the first voice when market changes if nothing selected.
  useEffect(() => {
    if (voices.length > 0 && !voices.find((v) => v.id === selectedVoiceId)) {
      onSelect(voices[0].id, voices[0].name);
    }
  }, [voices, selectedVoiceId, onSelect]);

  // Stop any preview when leaving the picker.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function togglePreview(id: string, url: string | null | undefined) {
    if (!url) return;
    if (playingId === id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId(null);
      }
    };
    audio.onerror = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId(null);
      }
    };
    audio.play().catch(() => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId(null);
      }
    });
    audioRef.current = audio;
    setPlayingId(id);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading voices...
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {voices.map((v) => {
        const active = v.id === selectedVoiceId;
        const playing = playingId === v.id;
        const hasPreview = Boolean(v.previewUrl);
        return (
          <div
            key={v.id}
            className={cn(
              "rounded-xl border p-3 transition-colors flex items-start gap-3",
              active
                ? "border-primary bg-primary/10"
                : "border-border bg-background/40 hover:border-primary/40",
            )}
            data-testid={`voice-${v.id}`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePreview(v.id, v.previewUrl ?? null);
              }}
              disabled={!hasPreview}
              title={
                hasPreview
                  ? playing
                    ? "Stop preview"
                    : "Play preview"
                  : "No preview available"
              }
              className={cn(
                "shrink-0 grid place-items-center rounded-full h-9 w-9 border transition-colors",
                hasPreview
                  ? playing
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                  : "border-border bg-background/40 text-muted-foreground cursor-not-allowed",
              )}
              data-testid={`button-preview-${v.id}`}
            >
              {!hasPreview ? (
                <VolumeX className="h-4 w-4" />
              ) : playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onSelect(v.id, v.name)}
              className="flex-1 min-w-0 text-left"
              data-testid={`button-select-${v.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "grid place-items-center rounded-md p-1.5 shrink-0",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <Mic2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{v.accent}</div>
                  </div>
                </div>
                {active && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider shrink-0">
                    Selected
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{v.description}</p>
            </button>
          </div>
        );
      })}
      {voices.length > 0 && (
        <p className="text-[11px] text-muted-foreground mt-1">
          Tap the play button to hear a sample. Tap the card to select that voice for your video.
        </p>
      )}
    </div>
  );
}
