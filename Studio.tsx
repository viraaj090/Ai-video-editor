import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { ScriptForm } from "@/components/ScriptForm";
import { ScriptDisplay } from "@/components/ScriptDisplay";
import { FloatingChat } from "@/components/FloatingChat";
import { VoicePicker } from "@/components/VoicePicker";
import { ClipPicker } from "@/components/ClipPicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateScript,
  useSynthesizeVoice,
  useRenderVideo,
  useSearchPexelsClips,
  useGetMe,
  type ScriptGeneration,
  type PexelsClip,
} from "@workspace/api-client-react";
import { ShareBonusButton } from "@/components/ShareBonusButton";
import { formatDuration, formatLockoutCountdown } from "@/lib/format";
import type { Market } from "@/lib/markets";
import { marketLabel } from "@/lib/markets";
import {
  Mic,
  Wand2,
  Film,
  Download,
  Loader2,
  CheckCircle2,
  LockKeyhole,
  Youtube,
  ScrollText,
} from "lucide-react";

interface SceneSlot {
  order: number;
  narration: string;
  keywords: string[];
  selected:
    | {
        url: string;
        kind: "pexels" | "upload" | "image";
        thumbnailUrl: string;
        label: string;
        durationSeconds: number;
      }
    | null;
  options: PexelsClip[];
}

export function Studio() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data: me } = useGetMe();
  const lockedCountdown = formatLockoutCountdown(me?.lockedUntil ?? null);
  const isLocked = !!lockedCountdown;
  const noCredits = !!me && me.creditsRemaining <= 0;

  const [market, setMarket] = useState<Market>("india");
  const [script, setScript] = useState<ScriptGeneration | null>(null);
  const [scenes, setScenes] = useState<SceneSlot[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
  const [audio, setAudio] = useState<{ audioUrl: string; durationSeconds: number } | null>(null);
  const [renderResult, setRenderResult] = useState<{
    historyId: number;
    mp4Url: string;
    thumbnailUrl: string;
    durationSeconds: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("script");

  const generate = useGenerateScript();
  const searchClips = useSearchPexelsClips();
  const synth = useSynthesizeVoice();
  const render = useRenderVideo();

  // After a fresh script, prefetch clips for each scene.
  useEffect(() => {
    if (!script) return;
    let cancelled = false;
    (async () => {
      const newSlots: SceneSlot[] = script.scenes.map((s) => ({
        order: s.order,
        narration: s.narration,
        keywords: s.keywords,
        selected: null,
        options: [],
      }));
      setScenes(newSlots);
      // Fetch all keywords in one batched search.
      const allKeywords = Array.from(
        new Set(script.scenes.flatMap((s) => s.keywords)),
      );
      if (allKeywords.length === 0) return;
      try {
        const res = await searchClips.mutateAsync({
          data: { keywords: allKeywords, perKeyword: 3 },
        });
        if (cancelled) return;
        const byKeyword = new Map<string, PexelsClip[]>();
        for (const c of res.clips) {
          if (!byKeyword.has(c.keyword)) byKeyword.set(c.keyword, []);
          byKeyword.get(c.keyword)!.push(c);
        }
        setScenes((prev) =>
          prev.map((slot) => {
            const opts = slot.keywords.flatMap((k) => byKeyword.get(k) ?? []);
            const dedup = Array.from(new Map(opts.map((c) => [c.id, c])).values()).slice(0, 6);
            return {
              ...slot,
              options: dedup,
              selected:
                dedup.length > 0
                  ? {
                      url: dedup[0].videoUrl,
                      kind: "pexels",
                      thumbnailUrl: dedup[0].thumbnailUrl,
                      label: dedup[0].keyword,
                      durationSeconds: dedup[0].durationSeconds,
                    }
                  : null,
            };
          }),
        );
      } catch {
        // toast handled when explicitly retrying
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  const fullScript = script?.fullScript ?? "";
  const allClipsReady = useMemo(
    () => scenes.length > 0 && scenes.every((s) => s.selected !== null),
    [scenes],
  );

  function onUseManualScript(input: {
    title: string;
    script: string;
    niche: string;
    keywords: string[];
  }) {
    setRenderResult(null);
    setAudio(null);

    // Split the script into roughly equal scenes by sentence so the user can
    // still pick clip-by-clip B-roll. Aim for ~6 seconds per scene at typical
    // speech pace (~15 chars/sec).
    const text = input.script.trim();
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const sceneCount = Math.max(
      3,
      Math.min(8, Math.ceil(text.length / 90)),
    );
    const groupSize = Math.max(1, Math.ceil(sentences.length / sceneCount));
    const sceneChunks: string[] = [];
    for (let i = 0; i < sentences.length; i += groupSize) {
      sceneChunks.push(sentences.slice(i, i + groupSize).join(" "));
    }
    if (sceneChunks.length === 0) sceneChunks.push(text);

    // Distribute the user's keywords across scenes so every scene has at least
    // one search term. If the user gave none, fall back to the first words of
    // each scene as a best-effort keyword.
    const keywords = input.keywords.length > 0 ? input.keywords : [];
    const scenes = sceneChunks.map((narration, i) => {
      const sceneKeywords =
        keywords.length > 0
          ? [keywords[i % keywords.length]]
          : narration
              .split(/\s+/)
              .filter((w) => w.length > 4)
              .slice(0, 2);
      return {
        order: i + 1,
        narration,
        keywords: sceneKeywords.length > 0 ? sceneKeywords : ["lifestyle"],
      };
    });

    setScript({
      title: input.title,
      hook: sentences[0] ?? text.slice(0, 80),
      fullScript: text,
      scenes,
      hashtags: [],
      market,
      creditsRemaining: me?.creditsRemaining ?? 0,
      lockedUntil: me?.lockedUntil ?? null,
    });
    setActiveTab("script");
    toast({
      title: "Script loaded",
      description: "Pick a voice and clips to render your video.",
    });
  }

  function onGenerate(input: import("@/components/ScriptForm").GenerateInput) {
    setRenderResult(null);
    setAudio(null);
    generate.mutate(
      {
        data: {
          prompt: input.prompt,
          market,
          niche: input.niche || null,
          targetSeconds: input.targetSeconds,
          buildType: input.buildType,
          tone: input.tone,
          length: input.length,
          options: input.options,
        },
      },
      {
        onSuccess: (data) => {
          setScript(data);
          setActiveTab("script");
          qc.invalidateQueries({ queryKey: ["/me"] });
          if (data.xpAwarded && data.xpAwarded > 0) {
            const bonus = data.bonusCreditsGranted ?? 0;
            toast({
              title: data.levelUp
                ? `Level up! You're now level ${data.newLevel ?? "?"}.`
                : `+${data.xpAwarded} XP`,
              description: bonus
                ? `You earned ${bonus} bonus credit${bonus > 1 ? "s" : ""} for leveling up.`
                : data.qualityScore != null
                ? `Build score ${data.qualityScore}/100. Streak: ${data.streak ?? 1} day${(data.streak ?? 1) > 1 ? "s" : ""}.`
                : undefined,
            });
          }
        },
        onError: (err) => {
          const anyErr = err as { status?: number; error?: { error?: string; lockedUntil?: string } };
          if (anyErr.status === 402) {
            qc.invalidateQueries({ queryKey: ["/me"] });
            toast({
              title: "Out of credits",
              description:
                anyErr.error?.error ??
                "You've used all 4 free credits. Share on WhatsApp for +1, or wait for the cooldown to end.",
            });
          } else {
            toast({
              title: "Couldn't generate",
              description: "Try again in a moment.",
            });
          }
        },
      },
    );
  }

  function onSynth() {
    if (!fullScript || !selectedVoiceId) return;
    synth.mutate(
      { data: { text: fullScript, voiceId: selectedVoiceId } },
      {
        onSuccess: (data) => {
          setAudio(data);
          setActiveTab("clips");
        },
        onError: () =>
          toast({ title: "Voice generation failed", description: "Try a different voice." }),
      },
    );
  }

  function onRender() {
    if (!script || !audio || !allClipsReady) return;
    const clips = scenes.map((s) => ({
      url: s.selected!.url,
      kind: s.selected!.kind,
      durationSeconds: s.selected!.durationSeconds || null,
    }));
    render.mutate(
      {
        data: {
          title: script.title,
          market,
          script: fullScript,
          audioUrl: audio.audioUrl,
          voiceName: selectedVoiceName,
          clips,
        },
      },
      {
        onSuccess: (data) => {
          setRenderResult(data);
          setActiveTab("render");
          qc.invalidateQueries({ queryKey: ["/history"] });
        },
        onError: () =>
          toast({ title: "Render failed", description: "Please try again." }),
      },
    );
  }

  function applyRewrite(newScript: string) {
    if (!script) return;
    setScript({ ...script, fullScript: newScript });
    setAudio(null); // voice must be regenerated
    setRenderResult(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-6">
          <div className="space-y-6 min-w-0">
            {(isLocked || noCredits) && (
              <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">
                      {isLocked
                        ? `You're in cooldown — ${lockedCountdown} until your credits reset.`
                        : "You're out of credits."}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Free tier gives you 4 credits, then a 15-day cooldown. Share ViralForge
                      on WhatsApp for +1 instant credit.
                    </p>
                    <div className="mt-3">
                      <ShareBonusButton />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ScriptForm
              market={market}
              onMarketChange={setMarket}
              loading={generate.isPending}
              disabled={isLocked || noCredits}
              onGenerate={onGenerate}
              onUseManualScript={onUseManualScript}
            />

            {script && (
              <Card className="overflow-hidden border-border bg-card/70">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="rounded-none border-b border-border bg-transparent p-0 h-auto w-full justify-start">
                    <TabRow icon={<ScrollText className="h-4 w-4" />} value="script" label="Script" />
                    <TabRow icon={<Mic className="h-4 w-4" />} value="voice" label="Voice" />
                    <TabRow icon={<Film className="h-4 w-4" />} value="clips" label="Clips" />
                    <TabRow icon={<Wand2 className="h-4 w-4" />} value="render" label="Render" />
                  </TabsList>

                  <TabsContent value="script" className="p-5 sm:p-6 mt-0">
                    <ScriptDisplay data={{ ...script, fullScript }} />
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => setActiveTab("voice")} data-testid="button-next-voice">
                        Next: Pick a voice
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="voice" className="p-5 sm:p-6 mt-0 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Pick a voice for {marketLabel(market)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        These voices are tuned for the {marketLabel(market)} market.
                      </p>
                    </div>
                    <VoicePicker
                      market={market}
                      selectedVoiceId={selectedVoiceId}
                      onSelect={(id, name) => {
                        setSelectedVoiceId(id);
                        setSelectedVoiceName(name);
                        setAudio(null);
                      }}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      {audio ? (
                        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <audio src={audio.audioUrl} controls className="flex-1" data-testid="audio-preview" />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {selectedVoiceName ? `Selected: ${selectedVoiceName}` : "Select a voice above"}
                        </span>
                      )}
                      <Button
                        onClick={onSynth}
                        disabled={!selectedVoiceId || synth.isPending || !fullScript}
                        data-testid="button-generate-voice"
                      >
                        {synth.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Generating voice...
                          </>
                        ) : audio ? (
                          <>
                            <Mic className="h-4 w-4" /> Regenerate voice
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" /> Generate voice
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="clips" className="p-5 sm:p-6 mt-0 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Pick a clip for each scene</h3>
                      <p className="text-sm text-muted-foreground">
                        Stock footage from Pexels matched to your script. Tap any thumbnail to use it,
                        or upload your own JPG/MP4.
                      </p>
                    </div>
                    <ClipPicker scenes={scenes} onChange={setScenes} />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setActiveTab("render")}
                        disabled={!allClipsReady || !audio}
                        data-testid="button-next-render"
                      >
                        {!audio
                          ? "Generate voice first"
                          : !allClipsReady
                            ? "Pick a clip for every scene"
                            : "Next: Render"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="render" className="p-5 sm:p-6 mt-0 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Render your 1080p MP4</h3>
                      <p className="text-sm text-muted-foreground">
                        We'll concatenate clips, sync the voiceover, and output a clean 1080p video.
                        This usually takes 20-60 seconds.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Stat label="Voice" value={audio ? selectedVoiceName ?? "Ready" : "Missing"} ok={!!audio} />
                      <Stat
                        label="Clips"
                        value={`${scenes.filter((s) => s.selected).length}/${scenes.length}`}
                        ok={allClipsReady}
                      />
                      <Stat
                        label="Voiceover length"
                        value={audio ? formatDuration(audio.durationSeconds) : "—"}
                        ok={!!audio}
                      />
                    </div>

                    {!renderResult ? (
                      <Button
                        size="lg"
                        className="w-full h-12 text-base"
                        onClick={onRender}
                        disabled={!audio || !allClipsReady || render.isPending}
                        data-testid="button-render"
                      >
                        {render.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Rendering... do not close this tab
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4" /> Render MP4
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-4">
                        <video
                          src={renderResult.mp4Url}
                          poster={renderResult.thumbnailUrl}
                          controls
                          className="w-full rounded-lg bg-black"
                          data-testid="video-result"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button asChild data-testid="button-download-mp4">
                            <a href={renderResult.mp4Url} download>
                              <Download className="h-4 w-4" /> Download MP4
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            asChild
                            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                            data-testid="button-publish-youtube"
                          >
                            <a
                              href="https://www.youtube.com/upload"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Youtube className="h-4 w-4" /> Publish to YouTube
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate("/history")}
                            data-testid="button-view-history"
                          >
                            View history
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          YouTube publishing opens YouTube's uploader in a new tab. Drag the
                          downloaded MP4 in to publish — title and hashtags are ready in your script.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            )}

            {!script && (
              <Card className="border-dashed border-border bg-card/40 p-10 text-center">
                <Wand2 className="h-8 w-8 text-primary mx-auto" />
                <h3 className="mt-3 text-lg font-semibold">Your script will appear here</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Choose a market, type a topic, and tap Generate. The market controls the
                  language, slang, and voice options.
                </p>
              </Card>
            )}
          </div>

        </div>
      </main>

      <FloatingChat
        script={fullScript}
        market={market}
        onApply={applyRewrite}
      />
    </div>
  );
}

function TabRow({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-3"
      data-testid={`tab-${value}`}
    >
      <span className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </TabsTrigger>
  );
}

function Stat({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${ok ? "border-primary/40 bg-primary/5" : "border-border bg-background/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold mt-1 truncate ${ok ? "text-foreground" : "text-muted-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
