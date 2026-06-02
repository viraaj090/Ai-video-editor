import { useEffect, useState } from "react";
import { Coins, LockKeyhole, Crown } from "lucide-react";
import { formatLockoutCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CreditPill({
  creditsRemaining,
  lockedUntil,
  unlimited,
  isOwner,
  className,
}: {
  creditsRemaining: number;
  lockedUntil: string | null;
  unlimited?: boolean;
  isOwner?: boolean;
  className?: string;
}) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!lockedUntil || unlimited) return;
    const t = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [lockedUntil, unlimited]);

  if (unlimited) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-primary-foreground",
          "bg-gradient-to-r from-primary via-primary to-red-700",
          "shadow-[0_0_20px_-4px_hsl(0_80%_55%/0.6)]",
          className,
        )}
        data-testid="credit-pill-unlimited"
      >
        <Crown className="h-3.5 w-3.5" />
        <span className="uppercase tracking-wider text-[11px]">
          {isOwner ? "Owner · Unlimited" : "Pro · Unlimited"}
        </span>
      </div>
    );
  }

  const countdown = formatLockoutCountdown(lockedUntil);
  if (countdown) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary",
          className,
        )}
        data-testid="credit-pill-locked"
      >
        <LockKeyhole className="h-3.5 w-3.5" />
        <span className="tabular-nums">Cooldown {countdown}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium",
        creditsRemaining <= 1 && "border-primary/50 text-primary",
        className,
      )}
      data-testid="credit-pill"
    >
      <Coins className="h-3.5 w-3.5" />
      <span className="tabular-nums">
        {creditsRemaining} {creditsRemaining === 1 ? "credit" : "credits"}
      </span>
    </div>
  );
}
