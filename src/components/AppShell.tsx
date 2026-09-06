import { Link } from "@tanstack/react-router";
import { CalendarDays, LogOut, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/services", label: "บริการ", icon: Sparkles },
  { to: "/book", label: "จองคิว", icon: Scissors },
  { to: "/bookings", label: "การจองของฉัน", icon: CalendarDays },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="barber-stripe h-1 w-full" />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/services" className="flex items-center gap-2">
            <span className="gradient-primary flex size-9 items-center justify-center rounded-md text-primary-foreground">
              <Scissors className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-wide">
              THE BLADE<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-primary/15 text-primary" }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-primary/15 text-primary" }}
              >
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-4" /> หลังบ้าน
                </span>
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profile?.username ?? "ลูกค้า"}
            </span>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="size-4" /> ออก
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <ShieldCheck className="size-5" />
            หลังบ้าน
          </Link>
        )}
      </nav>
    </div>
  );
}
