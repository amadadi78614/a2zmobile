import {
  Zap,
  BatteryCharging,
  Cable,
  Volume2,
  Headphones,
  Wifi,
  Flame,
  Droplet,
  Wind,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "mobile-tech" | "vape" | "hookah";

const clusters: Record<Variant, { Icon: typeof Zap; label: string }[]> = {
  "mobile-tech": [
    { Icon: Zap, label: "Chargers" },
    { Icon: BatteryCharging, label: "Power banks" },
    { Icon: Cable, label: "Cables" },
    { Icon: Volume2, label: "Speakers" },
    { Icon: Headphones, label: "Earbuds" },
    { Icon: Wifi, label: "Networking" },
  ],
  hookah: [
    { Icon: Flame, label: "Charcoal" },
    { Icon: Wind, label: "Smoke" },
    { Icon: Droplet, label: "Flavours" },
  ],
  vape: [],
};

// Placeholder product visuals rendered in code rather than a static image — crisper at every
// size/DPR than the flat black-PNG-with-text-baked-in images this replaced, and honestly labels
// itself as a placeholder rather than pretending to be finished photography.
export function HeroVisual({ variant }: { variant: Variant }) {
  if (variant === "vape") {
    return (
      <div className="relative flex aspect-square w-full max-w-md items-center justify-center">
        <div className="absolute -inset-6 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 border border-paper/15 px-10 py-12 text-center">
          <Clock size={32} className="text-primary" strokeWidth={1.5} />
          <span className="eyebrow text-paper/50">Landing soon</span>
          <p className="max-w-[14rem] text-sm leading-relaxed text-paper/60">
            Production photography will go here once the range is in stock.
          </p>
        </div>
      </div>
    );
  }

  const icons = clusters[variant];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl" />
      <div
        className={cn(
          "relative grid h-full w-full place-items-center gap-4",
          icons.length > 4 ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        {icons.map(({ Icon, label }, i) => (
          <div
            key={label}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-full border border-primary/25 bg-paper/[0.03] p-6 backdrop-blur-sm transition-transform duration-500",
              i % 2 === 0 ? "translate-y-2" : "-translate-y-2"
            )}
            style={{ aspectRatio: "1 / 1" }}
          >
            <Icon size={22} className="text-primary" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-wide text-paper/50">
              {label}
            </span>
          </div>
        ))}
      </div>
      <span className="absolute bottom-0 right-0 text-[10px] uppercase tracking-wide text-paper/25">
        Placeholder &middot; photography pending
      </span>
    </div>
  );
}
