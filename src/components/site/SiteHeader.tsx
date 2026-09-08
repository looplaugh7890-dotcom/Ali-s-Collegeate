import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
] as const;

export const updateLinks = [
  { label: "TAC Academic Updates", to: "/updates/academic" },
  { label: "Official Updates", to: "/updates/official" },
  { label: "Teacher Job Updates", to: "/updates/teacher-jobs" },
  { label: "Student Portal", to: "/portal" },
] as const;

export const extraLinks = [
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUpdatesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur transition-shadow",
        scrolled ? "border-b border-border shadow-[0_6px_24px_-18px_oklch(0.29_0.09_262/0.6)]" : "border-b border-transparent",
      )}
    >
      <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary after:w-5" }}
                inactiveProps={{ className: "text-foreground/70" }}
                className="relative rounded-md px-3 py-2 text-sm font-medium transition-colors after:absolute after:bottom-1 after:left-3 after:h-[2px] after:w-0 after:rounded-full after:bg-gold after:transition-all hover:text-primary hover:after:w-5"
              >
                {l.label}
              </Link>
            ))}

            {/* Updates Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setUpdatesOpen((v) => !v)}
                onMouseEnter={() => setUpdatesOpen(true)}
                className={cn(
                  "relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors after:absolute after:bottom-1 after:left-3 after:h-[2px] after:rounded-full after:bg-gold after:transition-all hover:text-primary hover:after:w-5",
                  updatesOpen ? "text-primary after:w-5" : "text-foreground/70",
                )}
              >
                Updates
                <ChevronDown className={cn("size-3 transition-transform", updatesOpen && "rotate-180")} />
              </button>
              {updatesOpen && (
                <div
                  onMouseLeave={() => setUpdatesOpen(false)}
                  className="absolute top-full left-0 z-50 mt-1 w-56 rounded-xl border border-border bg-card p-2 shadow-lift"
                >
                  {updateLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => {
                        setUpdatesOpen(false);
                      }}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {extraLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-primary after:w-5" }}
                inactiveProps={{ className: "text-foreground/70" }}
                className="relative rounded-md px-3 py-2 text-sm font-medium transition-colors after:absolute after:bottom-1 after:left-3 after:h-[2px] after:w-0 after:rounded-full after:bg-gold after:transition-all hover:text-primary hover:after:w-5"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Button asChild variant="navy" size="default" className="hidden sm:inline-flex">
            <Link to="/portal">Student Portal</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-primary xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background xl:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary border-gold" }}
                inactiveProps={{ className: "text-foreground/80 border-transparent" }}
                className="border-l-2 py-2.5 pl-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-2">
              <p className="px-3 py-1.5 text-xs font-bold tracking-[0.15em] text-navy-2 uppercase">
                Updates
              </p>
              {updateLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "text-primary border-gold" }}
                  inactiveProps={{ className: "text-foreground/80 border-transparent" }}
                  className="border-l-2 py-2.5 pl-6 text-sm font-medium"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {extraLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary border-gold" }}
                inactiveProps={{ className: "text-foreground/80 border-transparent" }}
                className="border-l-2 py-2.5 pl-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild variant="navy" className="mt-3">
              <Link to="/portal" onClick={() => setOpen(false)}>
                Student Portal
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
