import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MarketSelect } from "./MarketSelect";
import { NICHES } from "@/lib/niches";
import type { Market } from "@/lib/markets";
import {
  Sparkles,
  Loader2,
  Lightbulb,
  Shuffle,
  ScrollText,
  PenLine,
  Mic,
  Film,
  Clapperboard,
} from "lucide-react";
import type {
  BuildLength,
  BuildTone,
  BuildType,
} from "@workspace/api-client-react";

export interface BuildOptionsState {
  chapters: boolean;
  monetize: boolean;
  broll: boolean;
}

export interface GenerateInput {
  prompt: string;
  niche: string;
  targetSeconds: number;
  buildType: BuildType;
  tone: BuildTone;
  length: BuildLength;
  options: BuildOptionsState;
}

const TONE_OPTIONS: { value: BuildTone; label: string }[] = [
  { value: "cinematic", label: "Cinematic & premium" },
  { value: "friendly", label: "Friendly & simple" },
  { value: "high-energy", label: "High-energy" },
  { value: "authoritative", label: "Authoritative" },
  { value: "storytelling", label: "Storytelling" },
  { value: "comedic", label: "Comedic" },
];

const LENGTH_OPTIONS: { value: BuildLength; label: string }[] = [
  { value: "short", label: "Short (30–60s)" },
  { value: "medium", label: "Medium (2–6 min)" },
  { value: "long", label: "Long (8–25 min)" },
  { value: "podcast", label: "Podcast (20–60 min)" },
];

const TYPE_OPTIONS: {
  value: BuildType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "reel",
    label: "Reel / Shorts",
    desc: "Vertical, punchy, 30–75s with hook + voice + clips.",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    value: "long",
    label: "Long YouTube Video",
    desc: "8–25 min plan with chapters, B-roll list & retention beats.",
    icon: <Film className="h-3.5 w-3.5" />,
  },
  {
    value: "audio",
    label: "Audio Plan",
    desc: "Voiceover-first script with SFX/music cues for each scene.",
    icon: <Mic className="h-3.5 w-3.5" />,
  },
];

export function ScriptForm({
  market,
  onMarketChange,
  loading,
  disabled,
  onGenerate,
  onUseManualScript,
  initialPrompt,
  initialBuildType,
}: {
  market: Market;
  onMarketChange: (m: Market) => void;
  loading: boolean;
  disabled?: boolean;
  onGenerate: (input: GenerateInput) => void;
  onUseManualScript: (input: {
    title: string;
    script: string;
    niche: string;
    keywords: string[];
  }) => void;
  initialPrompt?: string;
  initialBuildType?: BuildType;
}) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [nicheId, setNicheId] = useState<string>("self-improvement");
  const [targetSeconds, setTargetSeconds] = useState(45);
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualScript, setManualScript] = useState("");
  const [manualKeywords, setManualKeywords] = useState("");

  const [buildType, setBuildType] = useState<BuildType>(initialBuildType ?? "reel");
  const [tone, setTone] = useState<BuildTone>("high-energy");
  const [length, setLength] = useState<BuildLength>(
    initialBuildType === "long" || initialBuildType === "audio" ? "long" : "short",
  );
  const [chapters, setChapters] = useState(true);
  const [monetize, setMonetize] = useState(true);
  const [broll, setBroll] = useState(true);

  const currentNiche = useMemo(
    () => NICHES.find((n) => n.id === nicheId) ?? NICHES[0],
    [nicheId],
  );

  function pickTopic(topic: string) {
    setPrompt(topic);
  }

  function shuffleTopic() {
    const list = currentNiche.topics;
    const next = list[Math.floor(Math.random() * list.length)];
    setPrompt(next);
  }

  function submit() {
    if (!prompt.trim() || disabled) return;
    onGenerate({
      prompt: prompt.trim(),
      niche: currentNiche.label,
      targetSeconds,
      buildType,
      tone,
      length,
      options: { chapters, monetize, broll },
    });
  }

  function submitManual() {
    if (disabled) return;
    const text = manualScript.trim();
    if (!text) return;
    const keywords = manualKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const title = manualTitle.trim() || text.split(/\.|\n/)[0].slice(0, 60);
    onUseManualScript({
      title,
      script: text,
      niche: currentNiche.label,
      keywords,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/40 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center rounded-md bg-primary/15 text-primary p-1.5">
              {manualMode ? <PenLine className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                {manualMode ? "Manual script mode" : "AI script mode"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {manualMode
                  ? "Paste your own script — no AI generation, no credits used."
                  : "Let AI write a viral script from your topic."}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor="manual-mode" className="text-xs uppercase tracking-wider text-muted-foreground">
              Manual
            </Label>
            <Switch
              id="manual-mode"
              checked={manualMode}
              onCheckedChange={setManualMode}
              data-testid="switch-manual-mode"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Market
            </Label>
            <div className="mt-1.5">
              <MarketSelect value={market} onChange={onMarketChange} />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Niche
            </Label>
            <div className="mt-1.5">
              <Select value={nicheId} onValueChange={setNicheId}>
                <SelectTrigger
                  className="w-full h-11 bg-card border-border"
                  data-testid="select-niche"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((n) => (
                    <SelectItem key={n.id} value={n.id} data-testid={`option-niche-${n.id}`}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {!manualMode && (
          <>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                <Clapperboard className="h-3.5 w-3.5" />
                Build type
              </Label>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                {TYPE_OPTIONS.map((opt) => {
                  const active = buildType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBuildType(opt.value)}
                      className={`text-left rounded-lg border px-3 py-2.5 transition ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/50"
                      }`}
                      data-testid={`build-type-${opt.value}`}
                    >
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        {opt.icon}
                        {opt.label}
                      </div>
                      <div className="mt-1 text-[11px] leading-snug">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tone
                </Label>
                <div className="mt-1.5">
                  <Select value={tone} onValueChange={(v) => setTone(v as BuildTone)}>
                    <SelectTrigger
                      className="w-full h-11 bg-card border-border"
                      data-testid="select-tone"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Length bucket
                </Label>
                <div className="mt-1.5">
                  <Select value={length} onValueChange={(v) => setLength(v as BuildLength)}>
                    <SelectTrigger
                      className="w-full h-11 bg-card border-border"
                      data-testid="select-length"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LENGTH_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {(buildType === "long" || buildType === "audio") && (
              <div className="rounded-lg border border-border bg-background/40 p-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Plan extras
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <ToggleRow id="opt-chapters" checked={chapters} onChange={setChapters} label="Chapters & timestamps" />
                  <ToggleRow id="opt-broll" checked={broll} onChange={setBroll} label="B-roll & shot ideas" />
                  <ToggleRow id="opt-monetize" checked={monetize} onChange={setMonetize} label="Monetization tips" />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Topic ideas for {currentNiche.label}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={shuffleTopic}
                  className="h-7 text-xs text-primary hover:text-primary"
                  data-testid="button-shuffle-topic"
                >
                  <Shuffle className="h-3 w-3" /> Surprise me
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentNiche.topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => pickTopic(t)}
                    className="text-left"
                    data-testid={`topic-preset-${t.slice(0, 20)}`}
                  >
                    <Badge
                      variant={prompt === t ? "default" : "outline"}
                      className={
                        prompt === t
                          ? "cursor-pointer bg-primary text-primary-foreground"
                          : "cursor-pointer border-primary/30 text-foreground hover:border-primary hover:bg-primary/10"
                      }
                    >
                      {t}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="prompt" className="text-xs uppercase tracking-wider text-muted-foreground">
                Your topic
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Pick a preset above or type your own..."
                className="mt-1.5 min-h-20 bg-background border-border"
                data-testid="input-prompt"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Voiceover target: <span className="text-foreground tabular-nums">{targetSeconds}s</span>
              </Label>
              <div className="mt-3.5">
                <Slider
                  value={[targetSeconds]}
                  onValueChange={(v) => setTargetSeconds(v[0])}
                  min={20}
                  max={75}
                  step={5}
                  data-testid="slider-target-seconds"
                />
              </div>
              {buildType === "long" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Long-form mode keeps the voiceover bounded — the chapter outline covers the full {LENGTH_OPTIONS.find((l) => l.value === length)?.label}.
                </p>
              )}
            </div>

            <Button
              size="lg"
              onClick={submit}
              disabled={loading || disabled || !prompt.trim()}
              className="h-12 text-base"
              data-testid="button-generate-script"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Forging your build...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate build · 1 credit
                </>
              )}
            </Button>
          </>
        )}

        {manualMode && (
          <>
            <div>
              <Label htmlFor="manual-title" className="text-xs uppercase tracking-wider text-muted-foreground">
                Video title
              </Label>
              <Input
                id="manual-title"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Optional — we'll use the first sentence if blank"
                className="mt-1.5 bg-background border-border"
                data-testid="input-manual-title"
              />
            </div>

            <div>
              <Label htmlFor="manual-script" className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" />
                Your script
              </Label>
              <Textarea
                id="manual-script"
                value={manualScript}
                onChange={(e) => setManualScript(e.target.value)}
                placeholder="Paste or type the exact words you want the voiceover to read. We'll split it into scenes automatically."
                className="mt-1.5 min-h-[180px] bg-background border-border font-mono text-sm leading-relaxed"
                data-testid="input-manual-script"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Tip: ~150 words ≈ 60 seconds of voiceover at a natural pace.
              </p>
            </div>

            <div>
              <Label htmlFor="manual-keywords" className="text-xs uppercase tracking-wider text-muted-foreground">
                Visual keywords (comma-separated)
              </Label>
              <Input
                id="manual-keywords"
                value={manualKeywords}
                onChange={(e) => setManualKeywords(e.target.value)}
                placeholder="e.g. city skyline, gym workout, sunset beach"
                className="mt-1.5 bg-background border-border"
                data-testid="input-manual-keywords"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                These keywords are used to search Pexels for matching B-roll across all scenes.
              </p>
            </div>

            <Button
              size="lg"
              onClick={submitManual}
              disabled={disabled || !manualScript.trim()}
              className="h-12 text-base"
              data-testid="button-use-manual-script"
            >
              <PenLine className="h-4 w-4" />
              Use this script — 0 credits
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card/50 px-2.5 py-2">
      <Label htmlFor={id} className="text-xs leading-tight">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} data-testid={id} />
    </div>
  );
}
