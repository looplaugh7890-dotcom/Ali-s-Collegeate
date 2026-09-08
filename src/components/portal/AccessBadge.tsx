import { Download, GraduationCap, Lock } from "lucide-react";
import type { AccessLevel } from "@/types";

const map = {
  free: { label: "Free Access", Icon: Download, className: "border-gold/50 bg-gold/10 text-navy-2" },
  login: { label: "Login Required", Icon: Lock, className: "border-transparent bg-primary text-primary-foreground" },
  enrolled: {
    label: "Enrolled Students Only",
    Icon: GraduationCap,
    className: "border-navy-2/30 bg-secondary text-navy-2",
  },
} as const;

export function AccessBadge({ access }: { access: AccessLevel }) {
  const { label, Icon, className } = map[access];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase ${className}`}
    >
      <Icon className="size-3" aria-hidden /> {label}
    </span>
  );
}
