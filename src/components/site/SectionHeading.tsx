import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  inverted = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  inverted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-bold tracking-[0.2em] uppercase",
            inverted ? "text-gold" : "text-navy-2",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-2 text-2xl sm:text-3xl md:text-[2.1rem]",
          inverted && "text-primary-foreground",
        )}
      >
        {title}
      </h2>
      <span className={cn("gold-rule mt-4", align === "center" && "mx-auto")} />
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed sm:text-base",
            inverted ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}