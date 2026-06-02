import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useDeleteHistoryItem, useListHistory } from "@workspace/api-client-react";
import { formatDuration } from "@/lib/format";
import { marketLabel } from "@/lib/markets";
import { Download, Trash2, Youtube, Loader2, Film } from "lucide-react";

export function HistoryPage() {
  const { data, isLoading } = useListHistory();
  const { toast } = useToast();
  const qc = useQueryClient();
  const del = useDeleteHistoryItem({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/history"] });
        toast({ title: "Deleted" });
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-6">
          <div className="space-y-4 min-w-0">
            <div>
              <h1 className="text-2xl font-bold">Your videos</h1>
              <p className="text-sm text-muted-foreground">
                Every render you've forged. Download or republish anytime.
              </p>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            )}

            {data && data.items.length === 0 && (
              <Card className="border-dashed p-10 text-center">
                <Film className="h-8 w-8 text-primary mx-auto" />
                <h3 className="mt-3 text-lg font-semibold">No videos yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Head back to the studio and forge your first short.
                </p>
              </Card>
            )}

            <div className="grid gap-4">
              {data?.items.map((item) => (
                <Card key={item.id} className="overflow-hidden border-border bg-card/70" data-testid={`history-item-${item.id}`}>
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-64 shrink-0 bg-black">
                      <video
                        src={item.mp4Url}
                        poster={item.thumbnailUrl}
                        controls
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-lg leading-tight truncate" data-testid={`text-title-${item.id}`}>
                          {item.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => del.mutate({ id: item.id })}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-primary/40 text-primary">
                          {marketLabel(item.market)}
                        </Badge>
                        <Badge variant="secondary">{formatDuration(item.durationSeconds)}</Badge>
                        <Badge variant="secondary">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {item.script}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button asChild size="sm">
                          <a href={item.mp4Url} download>
                            <Download className="h-4 w-4" /> Download
                          </a>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <a
                            href="https://www.youtube.com/upload"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Youtube className="h-4 w-4" /> Publish
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
