import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CreditCard,
  FileText,
  Gauge,
  Mail,
  Megaphone,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { LogoIcon } from "@/components/site/Logo";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const adminItems = [
  { label: "Dashboard", to: "/admin", icon: Gauge },
  { label: "Students", to: "/admin/students", icon: Users },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Applications", to: "/admin/applications", icon: GraduationCap },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Resources", to: "/admin/resources", icon: FileText },
  { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
  { label: "Messages", to: "/admin/contacts", icon: Mail },
  { label: "Settings", to: "/admin/settings", icon: Settings },
] as const;

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const nav = (
    <nav aria-label="Admin" className="space-y-1">
      {adminItems.map(({ label, to, icon: Icon }) => (
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
      <button
        type="button"
        onClick={() => { logout(); setOpen(false); }}
        className="mt-4 flex w-full items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-gold"
      >
        <LogOut className="size-4 shrink-0" />
        Logout
      </button>
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
        <div className="mt-2 rounded-lg bg-gold/10 px-3 py-2 text-center text-xs font-bold text-gold">
          Admin Panel
        </div>
        <div className="mt-4 flex-1 overflow-y-auto">{nav}</div>
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
                  {user?.name?.charAt(0) || "A"}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-xs font-bold text-primary">{user?.name || "Admin"}</span>
                  <span className="block text-[0.7rem] text-muted-foreground">Administrator</span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Close admin menu" : "Open admin menu"}
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
