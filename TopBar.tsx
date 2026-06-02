import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";
import { CreditPill } from "./CreditPill";
import { ShareBonusButton } from "./ShareBonusButton";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@workspace/api-client-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  History,
  LogOut,
  Sparkles,
  Settings,
  Shield,
  Gift,
  Swords,
} from "lucide-react";
import { GameStatsPills } from "./GameStatsPills";

export function TopBar() {
  const { data: me } = useGetMe();
  const [location] = useLocation();

  function logout() {
    window.location.href = "/api/logout";
  }

  const initials = (
    (me?.firstName?.[0] ?? "") + (me?.lastName?.[0] ?? "")
  )
    .toUpperCase()
    .padEnd(1, "U");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" data-testid="link-home">
          <a className="flex items-center">
            <Logo />
          </a>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/" current={location === "/"} testid="link-studio">
            <Sparkles className="h-4 w-4" /> Studio
          </NavLink>
          <NavLink
            href="/quests"
            current={location.startsWith("/quests")}
            testid="link-quests"
          >
            <Swords className="h-4 w-4" /> Quests
          </NavLink>
          <NavLink
            href="/history"
            current={location.startsWith("/history")}
            testid="link-history"
          >
            <History className="h-4 w-4" /> History
          </NavLink>
          <NavLink
            href="/settings"
            current={location.startsWith("/settings")}
            testid="link-settings"
          >
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
          {me?.isOwner && (
            <NavLink
              href="/admin"
              current={location.startsWith("/admin")}
              testid="link-admin"
            >
              <Shield className="h-4 w-4" /> Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {me && (
            <div className="hidden md:block">
              <GameStatsPills xp={me.xp} level={me.level} streak={me.streak} />
            </div>
          )}
          {me && (
            <CreditPill
              creditsRemaining={me.creditsRemaining}
              lockedUntil={me.lockedUntil}
              unlimited={me.unlimited}
              isOwner={me.isOwner}
            />
          )}
          {me && !me.unlimited && (
            <div className="hidden md:block">
              <ShareBonusButton />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 rounded-full p-0"
                data-testid="button-user-menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={me?.profileImageUrl ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {me?.email && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {me.email}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/quests">
                  <a className="flex items-center gap-2 cursor-pointer">
                    <Swords className="h-4 w-4" /> Earn quests
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history">
                  <a className="flex items-center gap-2 cursor-pointer">
                    <History className="h-4 w-4" /> My videos
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings#redeem">
                  <a className="flex items-center gap-2 cursor-pointer">
                    <Gift className="h-4 w-4" /> Redeem code
                  </a>
                </Link>
              </DropdownMenuItem>
              {me?.isOwner && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <a className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" /> Admin
                    </a>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  current,
  testid,
  children,
}: {
  href: string;
  current: boolean;
  testid: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <a
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          current
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-testid={testid}
      >
        <span className="inline-flex items-center gap-1.5">{children}</span>
      </a>
    </Link>
  );
}
