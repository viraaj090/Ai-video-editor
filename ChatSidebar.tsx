import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRewriteScript } from "@workspace/api-client-react";
import type { Market } from "@/lib/markets";
import { Send, Sparkles, MessageSquare, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  scriptSnapshot?: string;
}

export function ChatSidebar({
  script,
  market,
  onApply,
}: {
  script: string;
  market: Market;
  onApply: (newScript: string) => void;
}) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hey — tell me how you want the script changed. Try: 'punchier hook', 'add a stat', 'make it sound less salesy', 'cut it shorter'.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const rewrite = useRewriteScript({
    mutation: {
      onSuccess: (data, vars) => {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: `Done. Rewrote based on: "${vars.data.instruction}". Tap "Use this version" to apply it to your script.`,
            scriptSnapshot: data.script,
          },
        ]);
      },
      onError: () => {
        toast({ title: "Rewrite failed", description: "Try again." });
      },
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, rewrite.isPending]);

  function send() {
    const text = input.trim();
    if (!text || rewrite.isPending || !script) return;
    setMessages((m) => [...m, { role: "user", text }]);
    rewrite.mutate({ data: { script, instruction: text, market } });
    setInput("");
  }

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border bg-card/70">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="grid place-items-center rounded-md bg-primary/15 p-1.5 text-primary">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">Script Assistant</div>
          <div className="text-xs text-muted-foreground">Free rewrites, no credits used</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border"
              }`}
              data-testid={`chat-message-${m.role}`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.scriptSnapshot && (
                <div className="mt-2.5 space-y-2">
                  <div className="rounded-lg bg-muted/50 p-2.5 text-xs text-foreground/90 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {m.scriptSnapshot}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onApply(m.scriptSnapshot!);
                      toast({ title: "Script updated" });
                    }}
                    className="w-full"
                    data-testid={`button-apply-rewrite-${i}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Use this version
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {rewrite.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-background border border-border px-3.5 py-2.5 text-sm text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rewriting...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={script ? "Ask for a tweak..." : "Generate a script first to start rewriting"}
            disabled={!script}
            className="min-h-11 max-h-24 bg-background border-border resize-none text-sm"
            data-testid="input-chat"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={!input.trim() || rewrite.isPending || !script}
            className="h-11 w-11 shrink-0"
            data-testid="button-chat-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
