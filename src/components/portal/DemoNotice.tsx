import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoNotice({ className, text }: { className?: string; text?: string }) {
  if (!text) return null;
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-navy-2",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{text}</span>
    </p>
  );
}
