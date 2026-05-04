import Link from "next/link";
import Image from "next/image";
import { CalendarDays, LayoutDashboard, LogIn, Trophy, UsersRound } from "lucide-react";
import { logoutUser } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

const publicNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teams", label: "Tim", icon: UsersRound },
  { href: "/schedule", label: "Jadwal", icon: CalendarDays },
  { href: "/standings", label: "Klasemen", icon: Trophy }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const nav = user ? publicNav : [...publicNav, { href: "/login", label: "Login", icon: LogIn }];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-md bg-white">
              <Image
                src="/mdl-logo.png"
                alt="MDL Season 2 Diskominfo League"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Diskominfo League</p>
              <p className="text-xs text-muted-foreground">Season Internal 2026</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <form action={logoutUser} className="flex items-center gap-3">
              <span className="hidden text-sm font-semibold text-muted-foreground sm:inline">{user.name}</span>
              <button className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted">
                Keluar
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              Masuk
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}
