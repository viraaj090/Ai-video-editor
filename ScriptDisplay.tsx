import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, ListOrdered, Camera, DollarSign } from "lucide-react";
import type { ScriptGeneration } from "@workspace/api-client-react";
import { ScorePill } from "./GameStatsPills";

export function ScriptDisplay({ data }: { data: ScriptGeneration }) {
  const score = data.qualityScore ?? null;
  const chapters = data.chapters ?? null;
  const broll = data.bRollIdeas ?? null;
  const monetize = data.monetizationTips ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Title</div>
          <h2 className="text-2xl font-bold mt-1" data-testid="text-title">{data.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {data.buildType && (
              <Badge variant="outline" className="text-[10px] uppercase border-primary/30 text-primary">
                {data.buildType === "long" ? "Long video" : data.buildType === "audio" ? "Audio plan" : "Short reel"}
              </Badge>
            )}
            {data.tone && (
              <Badge variant="outline" className="text-[10px] uppercase">
                {data.tone}
              </Badge>
            )}
            {data.length && (
              <Badge variant="outline" className="text-[10px] uppercase">
                {data.length}
              </Badge>
            )}
          </div>
        </div>
        {typeof score === "number" && <ScorePill score={score} />}
      </div>

      {typeof score === "number" && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Build quality</span>
            <span className="tabular-nums">{score}/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 transition-all"
              style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
              data-testid="bar-quality"
            />
          </div>
        </div>
      )}

      <Card className="border-primary/40 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">
              Hook
            </div>
            <p className="text-base font-medium mt-1" data-testid="text-hook">{data.hook}</p>
          </div>
        </div>
      </Card>

      {chapters && chapters.length > 0 && (
        <Section icon={<ListOrdered className="h-3.5 w-3.5" />} label={`Chapters (${chapters.length})`}>
          <ol className="space-y-1 text-sm">
            {chapters.map((c, i) => (
              <li key={i} className="rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-xs">
                {c}
              </li>
            ))}
          </ol>
        </Section>
      )}

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Full script
        </div>
        <div className="rounded-lg border border-border bg-background/40 p-4 whitespace-pre-wrap text-sm leading-relaxed" data-testid="text-full-script">
          {data.fullScript}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Scenes ({data.scenes.length})
        </div>
        <div className="grid gap-2">
          {data.scenes.map((s) => (
            <div key={s.order} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-primary">Scene {s.order}</span>
                <div className="flex flex-wrap gap-1">
                  {s.keywords.map((k) => (
                    <Badge key={k} variant="secondary" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm">{s.narration}</p>
            </div>
          ))}
        </div>
      </div>

      {broll && broll.length > 0 && (
        <Section icon={<Camera className="h-3.5 w-3.5" />} label={`B-roll & shot ideas (${broll.length})`}>
          <ul className="grid gap-1 text-sm">
            {broll.map((b, i) => (
              <li key={i} className="rounded-md border border-border bg-background/40 px-3 py-2">
                {b}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {monetize && monetize.length > 0 && (
        <Section icon={<DollarSign className="h-3.5 w-3.5" />} label={`Monetization tips (${monetize.length})`}>
          <ul className="grid gap-1 text-sm">
            {monetize.map((m, i) => (
              <li key={i} className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-emerald-100">
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.hashtags.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Hashtags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.hashtags.map((h) => (
              <Badge key={h} variant="outline" className="text-xs border-primary/30 text-primary">
                {h.startsWith("#") ? h : `#${h}`}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
