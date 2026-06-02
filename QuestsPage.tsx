import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useListQuests,
  useCreateQuest,
  useCompleteQuest,
  useResetQuests,
  type Quest,
  type QuestDifficulty,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Swords,
  Plus,
  Trophy,
  CheckCircle2,
  RefreshCcw,
  Flame,
  Star,
  Loader2,
  Sparkles,
} from "lucide-react";
import { GameStatsPills } from "@/components/GameStatsPills";

const DIFFICULTY_LABELS: Record<QuestDifficulty, { label: string; color: string }> = {
  easy: { label: "Easy · 25 XP", color: "border-emerald-300/30 text-emerald-300" },
  medium: { label: "Medium · 50 XP", color: "border-cyan-300/30 text-cyan-300" },
  hard: { label: "Hard · 100 XP", color: "border-rose-300/30 text-rose-300" },
};

export function QuestsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useListQuests();
  const create = useCreateQuest();
  const complete = useCompleteQuest();
  const reset = useResetQuests();

  const [niche, setNiche] = useState("");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("easy");

  const stats = data?.stats;
  const quests = data?.quests ?? [];
  const open = quests.filter((q) => !q.isCompleted);
  const done = quests.filter((q) => q.isCompleted);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["/quests"] });
    qc.invalidateQueries({ queryKey: ["/me"] });
  }

  function onNew() {
    create.mutate(
      { data: { niche: niche.trim() || null, difficulty, count: 1 } },
      {
        onSuccess: () => {
          refresh();
        },
        onError: () =>
          toast({ title: "Couldn't make a quest", description: "Try again." }),
      },
    );
  }

  function onComplete(q: Quest) {
    complete.mutate(
      { id: q.id },
      {
        onSuccess: (res) => {
          refresh();
          const bonus = res.reward.bonusCreditsGranted ?? 0;
          toast({
            title: res.reward.levelUp
              ? `Level up! +${res.reward.xpAwarded} XP`
              : `Quest cleared · +${res.reward.xpAwarded} XP`,
            description: bonus
              ? `You unlocked ${bonus} bonus credit${bonus > 1 ? "s" : ""}.`
              : `Streak day kept. Keep building!`,
          });
        },
        onError: () =>
          toast({ title: "Couldn't complete", description: "Refresh and try again." }),
      },
    );
  }

  function onReset() {
    if (!confirm("Wipe all quests? This can't be undone.")) return;
    reset.mutate(undefined, {
      onSuccess: () => refresh(),
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-6">
          <div className="rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Swords className="h-3.5 w-3.5" /> Earn quests
                </div>
                <h1 className="mt-3 text-2xl font-bold">Game your way to better videos</h1>
                <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                  Daily creator challenges grant XP. Hit a new level and we'll drop a free credit
                  in your account. Quests run offline — no AI calls, no credits used.
                </p>
              </div>
              {stats && (
                <div className="flex flex-col items-end gap-2">
                  <GameStatsPills xp={stats.xp} level={stats.level} streak={stats.streak} />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Stat label="Best score" value={`${stats.bestScore}`} icon={<Star className="h-3.5 w-3.5" />} />
                    <Stat label="Streak" value={`${stats.streak} day${stats.streak === 1 ? "" : "s"}`} icon={<Flame className="h-3.5 w-3.5" />} />
                    <Stat label="To next lvl" value={`${stats.xpToNextLevel} XP`} icon={<Trophy className="h-3.5 w-3.5" />} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Card className="border-border bg-card/70 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr,1fr,auto] sm:items-end">
              <div>
                <Label htmlFor="quest-niche" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Niche (optional)
                </Label>
                <Input
                  id="quest-niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Finance, Fitness, AI, Beauty"
                  className="mt-1.5 bg-background border-border"
                  data-testid="input-quest-niche"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </Label>
                <div className="mt-1.5">
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuestDifficulty)}>
                    <SelectTrigger className="w-full h-11 bg-card border-border" data-testid="select-quest-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (25 XP)</SelectItem>
                      <SelectItem value="medium">Medium (50 XP)</SelectItem>
                      <SelectItem value="hard">Hard (100 XP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={onNew}
                  disabled={create.isPending}
                  className="h-11"
                  data-testid="button-new-quest"
                >
                  {create.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Drawing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> New quest
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onReset}
                  disabled={reset.isPending || quests.length === 0}
                  className="h-11"
                  data-testid="button-reset-quests"
                >
                  <RefreshCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active ({open.length})
            </h2>
            {isLoading && (
              <Card className="border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
                Loading quests…
              </Card>
            )}
            {!isLoading && open.length === 0 && (
              <Card className="border-dashed border-border bg-card/40 p-8 text-center">
                <Sparkles className="h-7 w-7 text-primary mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No active quests. Spin one above to start earning XP and credits.
                </p>
              </Card>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {open.map((q) => (
                <QuestCard key={q.id} quest={q} onComplete={() => onComplete(q)} pending={complete.isPending} />
              ))}
            </div>
          </div>

          {done.length > 0 && (
            <div className="grid gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Completed ({done.length})
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {done.slice(0, 8).map((q) => (
                  <QuestCard key={q.id} quest={q} completed />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function QuestCard({
  quest,
  onComplete,
  pending,
  completed,
}: {
  quest: Quest;
  onComplete?: () => void;
  pending?: boolean;
  completed?: boolean;
}) {
  const diff = DIFFICULTY_LABELS[quest.difficulty];
  return (
    <Card
      className={`border-border bg-card/70 p-4 ${completed ? "opacity-70" : ""}`}
      data-testid={`quest-${quest.id}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline" className={`text-[10px] ${diff.color}`}>
          {diff.label}
        </Badge>
        {quest.niche && (
          <Badge variant="secondary" className="text-[10px]">
            {quest.niche}
          </Badge>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold">{quest.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{quest.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Reward: <strong className="text-foreground">{quest.xpReward} XP</strong>
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Done
          </span>
        ) : (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={pending}
            data-testid={`button-complete-${quest.id}`}
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Complete
          </Button>
        )}
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-2 py-1.5 min-w-[88px]">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
