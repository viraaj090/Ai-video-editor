import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MARKETS, type Market } from "@/lib/markets";
import { Globe2 } from "lucide-react";

export function MarketSelect({
  value,
  onChange,
}: {
  value: Market;
  onChange: (m: Market) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Market)}>
      <SelectTrigger
        className="w-full h-11 bg-card border-border"
        data-testid="select-market"
      >
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {MARKETS.map((m) => (
          <SelectItem key={m.id} value={m.id} data-testid={`option-market-${m.id}`}>
            <div className="flex flex-col">
              <span className="font-medium">{m.label}</span>
              <span className="text-xs text-muted-foreground">{m.tagline}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
