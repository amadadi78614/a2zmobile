import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="flex flex-col gap-3 border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
        <Icon
          size={16}
          className={cn(
            tone === "warning" && "text-primary",
            tone === "danger" && "text-secondary",
            tone === "default" && "text-ink-400"
          )}
        />
      </div>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}
