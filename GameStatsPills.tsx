import { Flame, Star, Trophy } from "lucide-react";

export function GameStatsPills({
  xp,
  level,
  streak,
  compact = false,
}: {
  xp: number;
  level: number;
  streak: number;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Pill
        icon={<Trophy className="h-3.5 w-3.5" />}
        label={compact ? `L${level}` : `Lv ${level}`}
        value={`${xp} XP`}
        color="text-amber-300"
        ring="border-amber-300/30 bg-amber-300/5"
        testid="pill-level"
      />
      <Pill
        icon={<Flame className="h-3.5 w-3.5" />}
        label="Streak"
        value={`${streak}`}
        color="text-orange-300"
        ring="border-orange-300/30 bg-orange-300/5"
        testid="pill-streak"
        hideLabelOnCompact={compact}
      />
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-300 border-emerald-300/30 bg-emerald-300/5"
      : score >= 60
      ? "text-cyan-300 border-cyan-300/30 bg-cyan-300/5"
      : score >= 40
      ? "text-amber-300 border-amber-300/30 bg-amber-300/5"
      : "text-rose-300 border-rose-300/30 bg-rose-300/5";
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
      data-testid="pill-score"
    >
      <Star className="h-3 w-3" />
      Score {score}/100
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  color,
  ring,
  testid,
  hideLabelOnCompact,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  ring: string;
  testid: string;
  hideLabelOnCompact?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${color} ${ring}`}
      data-testid={testid}
    >
      {icon}
      <span className={hideLabelOnCompact ? "hidden sm:inline" : ""}>{label}</span>
      <strong className="tabular-nums">{value}</strong>
    </div>
  );
}
