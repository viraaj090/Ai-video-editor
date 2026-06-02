import { Flame } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const icon =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <div className={`flex items-center gap-2 font-extrabold tracking-tight ${cls}`}>
      <span className="grid place-items-center rounded-md bg-primary text-primary-foreground p-1.5 shadow-[0_0_0_1px_hsl(var(--primary))]">
        <Flame className={icon} />
      </span>
      <span>
        Viral<span className="text-primary">Forge</span>
      </span>
    </div>
  );
}
