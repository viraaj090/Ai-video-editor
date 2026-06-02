import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  Sparkles,
  Mic,
  Film,
  Globe2,
  Crown,
  Gift,
  ShieldCheck,
} from "lucide-react";

export function Landing() {
  function login() {
    window.location.href = "/api/login";
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/25 blur-[120px] animate-blob" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-red-700/20 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px] animate-blob animation-delay-4000" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <header className="border-b border-border/50 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button onClick={login} data-testid="button-login-top">
            Sign in
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <section className="text-center animate-fade-in-up">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <Sparkles className="h-3.5 w-3.5" />
            Global YouTube Automation
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Forge viral shorts in{" "}
            <span className="bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
              4 markets.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Pick your audience — India, USA, UK, or Global. Type a topic. Get a
            scroll-stopping script in the right language and slang, a voiceover,
            stock clips, and a 1080p MP4 ready to publish.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={login}
              className="h-12 px-7 text-base shadow-[0_0_40px_-8px_hsl(0_80%_55%/0.6)] transition-transform hover:scale-105"
              data-testid="button-login-hero"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              4 free credits · no card · or redeem an access code
            </span>
          </div>
        </section>

        <section className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in-up animation-delay-200">
          <FeatureCard
            icon={<Globe2 className="h-5 w-5" />}
            title="Market-aware AI"
            body="Hinglish for India, Gen-Z slang for USA, dry wit for UK. The script feels native, not translated."
          />
          <FeatureCard
            icon={<Mic className="h-5 w-5" />}
            title="Bring your own voice"
            body="Curated free voices per market, plus paste in any ElevenLabs voice ID — including your own clones."
          />
          <FeatureCard
            icon={<Film className="h-5 w-5" />}
            title="MP4 in minutes"
            body="One render button. Concatenated, voiced, 1080p, with subtle Ken Burns motion and color grading."
          />
        </section>

        <section className="mt-20 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12 animate-fade-in-up animation-delay-400">
          <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary">
                <Crown className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Have a code?
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Unlock unlimited access in seconds.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                If someone shared a ViralForge code with you, sign in and paste
                it in Settings → Redeem. No credit card. No expiry on most codes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Button
                onClick={login}
                size="lg"
                variant="outline"
                className="border-primary/40 hover:bg-primary/10"
                data-testid="button-login-redeem"
              >
                <Gift className="h-4 w-4" /> Sign in & redeem
              </Button>
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Replit Auth — no
                passwords to remember
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built on Replit · ViralForge
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_-16px_hsl(0_80%_55%/0.4)]">
      <div className="absolute inset-x-0 -top-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
