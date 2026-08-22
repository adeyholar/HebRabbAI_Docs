import { cn } from "@/lib/cn";

export function HonorBadge({
  honor,
  className,
  compact = false,
}: {
  honor: { title: string; short: string };
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      title={honor.title}
      className={cn(
        "inline-flex min-h-7 max-w-full items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold tracking-wide text-primary-foreground",
        className,
      )}
    >
      <span className="truncate">{compact ? honor.short : honor.title}</span>
    </span>
  );
}
