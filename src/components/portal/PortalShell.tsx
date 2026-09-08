import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Gauge,
  HelpCircle,
  LogOut,
  Menu,
  Trophy,
  User,
  X,
} from "lucide-react";
import { LogoIcon } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", to: "/portal/dashboard", icon: Gauge },
  { label: "My Courses", to: "/portal/courses", icon: BookOpen },
  { label: "Resources", to: "/portal/resources", icon: FileText },
  { label: "Assignments", to: "/portal/assignments", icon: ClipboardList },
  { label: "Quizzes", to: "/portal/quizzes", icon: HelpCircle },
  { label: "Results", to: "/portal/results", icon: Trophy },
  { label: "Profile", to: "/portal/profile", icon: User },
] as const;

export function PortalShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const userName = user?.name || "Student";
  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const nav = (
    <nav aria-label="Portal" className="space-y-1">
      {items.map(({ label, to, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          activeProps={{ className: "bg-primary-foreground/12 text-primary-foreground border-gold" }}
          inactiveProps={{ className: "text-primary-foreground/70 border-transparent" }}
          className="flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
      <Link
        to="/portal/login"
        onClick={() => setOpen(false)}
        className="mt-4 flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-gold"
      >
        <LogOut className="size-4 shrink-0" />
        Logout
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 flex-col bg-primary p-4 lg:flex">
        <div className="flex flex-col items-center rounded-xl bg-primary-foreground/95 p-4">
          <LogoIcon size={56} />
          <span className="mt-2 text-center text-[0.7rem] font-extrabold tracking-tight text-primary">
            THE ALI&apos;S COLLEGIATE
          </span>
          <span className="text-[0.6rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Passion for Victory
          </span>
        </div>
        <div className="mt-6 flex-1">{nav}</div>
        <Link
          to="/"
          className="mt-6 block rounded-lg border border-primary-foreground/20 px-3 py-2.5 text-center text-xs font-semibold text-primary-foreground/80 hover:border-gold hover:text-gold"
        >
          Back to website
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
            <div className="min-w-0">
              <h1 className="truncate text-lg sm:text-xl">{title}</h1>
              {description ? (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2.5 sm:flex">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-xs font-bold text-primary">{userName}</span>
                  <span className="block text-[0.7rem] text-muted-foreground">{user?.email || ""}</span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Close portal menu" : "Open portal menu"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-primary lg:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
          {open ? <div className="bg-primary p-4 lg:hidden">{nav}</div> : null}
        </header>

        <main className={cn("flex-1 px-5 py-6 sm:py-8")}>{children}</main>
      </div>
    </div>
  );
}