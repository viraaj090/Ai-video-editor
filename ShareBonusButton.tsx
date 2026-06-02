import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useClaimShareBonus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Share2 } from "lucide-react";

export function ShareBonusButton() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const claim = useClaimShareBonus({
    mutation: {
      onSuccess: () => {
        toast({
          title: "+1 credit added",
          description: "Thanks for sharing! Your bonus credit is ready.",
        });
        qc.invalidateQueries({ queryKey: ["/me"] });
      },
      onError: () =>
        toast({
          title: "Could not grant bonus",
          description: "Try again in a moment.",
        }),
    },
  });

  function onShare() {
    if (busy) return;
    setBusy(true);
    const text = encodeURIComponent(
      "I just made a viral short with ViralForge — AI scripts, voiceovers, and clips in one click. Try it: ",
    );
    const url = encodeURIComponent(window.location.origin);
    const wa = `https://wa.me/?text=${text}${url}`;
    window.open(wa, "_blank", "noopener,noreferrer");
    // Grant the bonus optimistically — opening WhatsApp counts as a share intent.
    claim.mutate(undefined, {
      onSettled: () => setBusy(false),
    });
  }

  return (
    <Button
      variant="outline"
      onClick={onShare}
      disabled={claim.isPending || busy}
      className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
      data-testid="button-share-whatsapp"
    >
      <Share2 className="h-4 w-4" />
      Share on WhatsApp · +1 credit
    </Button>
  );
}
