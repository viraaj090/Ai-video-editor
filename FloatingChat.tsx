import { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import type { Market } from "@/lib/markets";
import { MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChat({
  script,
  market,
  onApply,
}: {
  script: string;
  market: Market;
  onApply: (newScript: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating button (visible when closed) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 grid place-items-center rounded-full bg-primary text-primary-foreground h-14 w-14 shadow-[0_8px_24px_-4px_hsl(0_80%_55%/0.5)] hover:scale-105 transition-transform"
          data-testid="button-open-chat"
          aria-label="Open script assistant"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 grid place-items-center rounded-full bg-foreground text-background text-[10px] font-bold h-5 w-5">
            AI
          </span>
        </button>
      )}

      {/* Chat panel */}
      <div
        className={cn(
          "fixed z-50 transition-transform",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[80vh] h-[600px] md:h-auto",
          // Desktop: bottom-right floating panel
          "md:inset-auto md:bottom-5 md:right-5 md:w-[380px] md:h-[600px] md:max-h-[80vh]",
          open ? "translate-y-0" : "translate-y-full md:translate-y-[110%]",
        )}
      >
        <div className="relative h-full">
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-3 -right-3 z-10 grid place-items-center rounded-full bg-background border border-border h-8 w-8 shadow-md hover:bg-muted"
            data-testid="button-close-chat"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="h-full">
            <ChatSidebar script={script} market={market} onApply={onApply} />
          </div>
        </div>
      </div>
    </>
  );
}
