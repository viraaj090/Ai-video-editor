import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useGetMe,
  useListAccessCodes,
  useCreateAccessCode,
  useDeleteAccessCode,
  useListAdminUsers,
  getListAccessCodesQueryKey,
} from "@workspace/api-client-react";
import {
  Crown,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Users,
  Copy,
  CheckCircle2,
} from "lucide-react";

export function AdminPage() {
  const [, navigate] = useLocation();
  const { data: me, isLoading: meLoading } = useGetMe();

  if (meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!me?.isOwner) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <h1 className="mt-4 text-2xl font-bold">Owner only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is reserved for the workspace owner.
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Back to Studio
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-bold">Admin</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Mint codes that grant unlimited access. Share them with anyone.
          </p>
        </div>
        <CodesPanel />
        <UsersPanel />
      </main>
    </div>
  );
}

function CodesPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useListAccessCodes();
  const create = useCreateAccessCode();
  const del = useDeleteAccessCode();

  const [label, setLabel] = useState("");
  const [grantUnlimited, setGrantUnlimited] = useState(true);
  const [bonusCredits, setBonusCredits] = useState(0);
  const [maxUses, setMaxUses] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function submit() {
    try {
      await create.mutateAsync({
        data: {
          label: label.trim() || null,
          grantUnlimited,
          bonusCredits,
          maxUses,
        },
      });
      toast({ title: "Code created" });
      setLabel("");
      qc.invalidateQueries({ queryKey: getListAccessCodesQueryKey() });
    } catch {
      toast({ title: "Failed to create code", variant: "destructive" });
    }
  }

  async function remove(id: number) {
    try {
      await del.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListAccessCodesQueryKey() });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  function copy(code: string, id: number) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Access codes</h2>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Label (optional)
          </Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. for Rohan"
            data-testid="input-code-label"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Bonus credits
          </Label>
          <Input
            type="number"
            min={0}
            max={500}
            value={bonusCredits}
            onChange={(e) => setBonusCredits(Number(e.target.value) || 0)}
            data-testid="input-bonus-credits"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Max uses
          </Label>
          <Input
            type="number"
            min={1}
            max={10000}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value) || 1)}
            data-testid="input-max-uses"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <Switch
            checked={grantUnlimited}
            onCheckedChange={setGrantUnlimited}
            data-testid="switch-grant-unlimited"
          />
          Grant unlimited access
        </label>
        <Button
          onClick={submit}
          disabled={create.isPending}
          data-testid="button-create-code"
        >
          <Plus className="h-4 w-4" />
          Mint code
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {data?.codes.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3"
            data-testid={`code-${c.id}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <code className="text-base font-bold tracking-wider text-primary">
                {c.code}
              </code>
              {c.label && (
                <span className="text-sm text-muted-foreground truncate">
                  {c.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                {c.grantUnlimited && (
                  <Badge className="bg-gradient-to-r from-primary to-red-700 text-primary-foreground border-0">
                    <Crown className="h-3 w-3" /> Unlimited
                  </Badge>
                )}
                {c.bonusCredits > 0 && (
                  <Badge variant="outline">+{c.bonusCredits} credits</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {c.usedCount}/{c.maxUses}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(c.code, c.id)}
                data-testid={`button-copy-${c.id}`}
              >
                {copiedId === c.id ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(c.id)}
                className="text-muted-foreground hover:text-primary"
                data-testid={`button-delete-code-${c.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {data?.codes.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            No codes yet. Mint your first one above.
          </p>
        )}
      </div>
    </Card>
  );
}

function UsersPanel() {
  const { data, isLoading } = useListAdminUsers();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
      <div className="space-y-1">
        {data?.users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">
                {u.firstName ?? ""} {u.lastName ?? ""}{" "}
                <span className="text-muted-foreground">
                  · {u.email ?? "no-email"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                {u.id}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {u.isOwner && (
                <Badge className="bg-gradient-to-r from-primary to-red-700 text-primary-foreground border-0">
                  Owner
                </Badge>
              )}
              {u.unlimited && !u.isOwner && (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Pro
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
