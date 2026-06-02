export type Market = "india" | "usa" | "uk" | "global";

export const MARKETS: Array<{ id: Market; label: string; flag: string; tagline: string }> = [
  { id: "india", label: "India", flag: "IN", tagline: "Hinglish, energetic" },
  { id: "usa", label: "USA", flag: "US", tagline: "Gen-Z slang, punchy" },
  { id: "uk", label: "United Kingdom", flag: "UK", tagline: "Dry wit, observational" },
  { id: "global", label: "Global", flag: "WW", tagline: "Neutral international" },
];

export function marketLabel(m: string): string {
  return MARKETS.find((x) => x.id === m)?.label ?? m;
}
