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
import { useToast } from "@/hooks/use-toast";
import {
  useGetMe,
  useRedeemAccessCode,
  useListCustomVoices,
  useAddCustomVoice,
  useDeleteCustomVoice,
  useGetElevenlabsKeyStatus,
  useSetElevenlabsKey,
  getGetMeQueryKey,
  getListCustomVoicesQueryKey,
  getGetElevenlabsKeyStatusQueryKey,
  getListVoicesQueryKey,
} from "@workspace/api-client-react";
import { MARKETS } from "@/lib/markets";
import type { Market } from "@/lib/markets";
import {
  Crown,
  Gift,
  KeyRound,
  Loader2,
  Mic2,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your access, voices, and personal API keys.
          </p>
        </div>
        <PlanCard />
        <RedeemCard />
        <CustomVoicesCard />
        <ElevenLabsKeyCard />
      </main>
    </div>
  );
}

function PlanCard() {
  const { data: me } = useGetMe();
  if (!me) return null;
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Your plan
          </div>
          <div className="mt-2 inline-flex items-center gap-2">
            {me.unlimited ? (
              <Badge className="bg-gradient-to-r from-primary to-red-700 text-primary-foreground border-0">
                <Crown className="h-3.5 w-3.5" />
                {me.isOwner ? "Owner · Unlimited" : "Pro · Unlimited"}
              </Badge>
            ) : (
              <Badge variant="outline">Free tier</Badge>
            )}
          </div>
          {me.unlimited && me.unlimitedSource && (
            <p className="mt-2 text-xs text-muted-foreground">
              Source: <span className="font-mono">{me.unlimitedSource}</span>
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {me.unlimited ? "Generations used" : "Credits left"}
          </div>
          <div className="text-2xl font-bold mt-1 tabular-nums">
            {me.unlimited ? me.totalCreditsUsed : me.creditsRemaining}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RedeemCard() {
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();
  const redeem = useRedeemAccessCode();

  async function submit() {
    if (!code.trim()) return;
    try {
      const result = await redeem.mutateAsync({ data: { code: code.trim() } });
      toast({
        title: result.alreadyRedeemed
          ? "Already redeemed"
          : result.grantUnlimited
            ? "Unlimited access unlocked"
            : `+${result.bonusCredits} credits added`,
        description: result.grantUnlimited
          ? "You now have unlimited generations."
          : undefined,
      });
      setCode("");
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      toast({
        title: "Redemption failed",
        description:
          e.status === 404
            ? "That code doesn't exist."
            : e.status === 410
              ? "That code has expired."
              : e.status === 409
                ? "That code is already used up."
                : "Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="p-6" id="redeem">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Redeem an access code</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Got a code? Paste it below to unlock unlimited access or bonus credits.
      </p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VF-XXXXXXXX"
          className="font-mono"
          data-testid="input-redeem-code"
        />
        <Button
          onClick={submit}
          disabled={redeem.isPending || !code.trim()}
          data-testid="button-redeem-code"
        >
          {redeem.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Redeem"
          )}
        </Button>
      </div>
    </Card>
  );
}

function CustomVoicesCard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListCustomVoices();
  const add = useAddCustomVoice();
  const del = useDeleteCustomVoice();

  const [name, setName] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [market, setMarket] = useState<Market>("global");
  const [description, setDescription] = useState("");

  async function submit() {
    if (!name.trim() || !voiceId.trim()) return;
    try {
      await add.mutateAsync({
        data: {
          name: name.trim(),
          voiceId: voiceId.trim(),
          market,
          description: description.trim() || null,
        },
      });
      toast({ title: "Voice added", description: name });
      setName("");
      setVoiceId("");
      setDescription("");
      qc.invalidateQueries({ queryKey: getListCustomVoicesQueryKey() });
      qc.invalidateQueries({ queryKey: getListVoicesQueryKey() });
    } catch {
      toast({ title: "Failed to add voice", variant: "destructive" });
    }
  }

  async function remove(id: number) {
    try {
      await del.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListCustomVoicesQueryKey() });
      qc.invalidateQueries({ queryKey: getListVoicesQueryKey() });
    } catch {
      toast({ title: "Failed to remove voice", variant: "destructive" });
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <Mic2 className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Custom voices</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Paste any ElevenLabs voice ID — including your own voice clones — and it
        will appear in the voice picker. For paid / library voices, you'll also
        need to set a personal ElevenLabs API key below.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Display name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My voice clone"
            data-testid="input-custom-voice-name"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Market
          </Label>
          <Select value={market} onValueChange={(v) => setMarket(v as Market)}>
            <SelectTrigger data-testid="select-custom-voice-market">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKETS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            ElevenLabs voice ID
          </Label>
          <Input
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
            className="font-mono"
            data-testid="input-custom-voice-id"
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Description (optional)
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cloned from my own recordings"
            data-testid="input-custom-voice-desc"
          />
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={submit}
          disabled={add.isPending || !name.trim() || !voiceId.trim()}
          data-testid="button-add-custom-voice"
        >
          <Plus className="h-4 w-4" /> Add voice
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading && (
          <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        )}
        {data?.voices.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3"
            data-testid={`custom-voice-${v.id}`}
          >
            <div>
              <div className="font-semibold text-sm">{v.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {v.voiceId} · {v.market}
              </div>
              {v.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {v.description}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(v.id)}
              className="text-muted-foreground hover:text-primary"
              data-testid={`button-remove-voice-${v.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {data?.voices.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">No custom voices yet.</p>
        )}
      </div>
    </Card>
  );
}

function ElevenLabsKeyCard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: status } = useGetElevenlabsKeyStatus();
  const setKey = useSetElevenlabsKey();
  const [apiKey, setApiKey] = useState("");

  async function save(clear: boolean) {
    try {
      await setKey.mutateAsync({
        data: { apiKey: clear ? null : apiKey.trim() },
      });
      toast({
        title: clear ? "Key cleared" : "Key saved",
        description: clear
          ? "Falling back to the default ElevenLabs key."
          : "Your personal key is now used for voice synthesis.",
      });
      setApiKey("");
      qc.invalidateQueries({ queryKey: getGetElevenlabsKeyStatusQueryKey() });
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch {
      toast({ title: "Failed to save key", variant: "destructive" });
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Your ElevenLabs API key</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Optional. If you set this, voice synthesis will use your personal
        ElevenLabs account — meaning you can use any paid library voice or your
        own cloned voices, billed to you.
      </p>
      {status?.hasKey && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />A personal key is currently set.
        </div>
      )}
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk_..."
          className="font-mono"
          data-testid="input-elevenlabs-key"
        />
        <Button
          onClick={() => save(false)}
          disabled={setKey.isPending || !apiKey.trim()}
          data-testid="button-save-elevenlabs-key"
        >
          Save
        </Button>
        {status?.hasKey && (
          <Button
            variant="outline"
            onClick={() => save(true)}
            disabled={setKey.isPending}
            data-testid="button-clear-elevenlabs-key"
          >
            Clear
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Stored encrypted at rest. Never shared.
      </p>
    </Card>
  );
}
