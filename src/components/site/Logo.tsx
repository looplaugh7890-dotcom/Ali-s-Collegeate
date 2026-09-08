import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false, showText = true }: { className?: string; inverted?: boolean; showText?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="The Ali's Collegiate home">
      <img
        src="/favicon.png"
        alt="The Ali's Collegiate crest logo"
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 object-contain"
      />
      {showText && (
        <span className="leading-tight">
          <span
            className={cn(
              "block text-[0.95rem] font-extrabold tracking-tight sm:text-base",
              inverted ? "text-primary-foreground" : "text-primary",
            )}
          >
            THE ALI&apos;S COLLEGIATE
          </span>
          <span
            className={cn(
              "block text-[0.68rem] font-medium tracking-[0.22em] uppercase",
              inverted ? "text-gold" : "text-muted-foreground",
            )}
          >
            Passion for Victory
          </span>
        </span>
      )}
    </Link>
  );
}

export function LogoIcon({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      src="/favicon.png"
      alt="The Ali's Collegiate"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
