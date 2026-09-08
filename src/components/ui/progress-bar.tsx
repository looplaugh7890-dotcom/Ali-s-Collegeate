export function ProgressBar({
  value,
  label,
  showValue = true,
}: {
  value: number;
  label?: string;
  showValue?: boolean;
}) {
  return (
    <div>
      {label || showValue ? (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label ? <span className="text-muted-foreground">{label}</span> : <span />}
          {showValue ? <span className="font-bold text-primary">{value}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className="h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}