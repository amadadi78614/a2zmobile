const specs = [
  "GENUINE STOCK ONLY",
  "FAST MBOMBELA DELIVERY",
  "7-DAY RETURNS",
  "WHATSAPP SUPPORT",
  "PAYFAST / OZOW / EFT",
  "NEW STOCK WEEKLY",
];

export function SpecTicker() {
  const row = [...specs, ...specs];
  return (
    <div className="overflow-hidden border-y border-ink bg-ink py-3">
      <div className="flex w-max animate-marquee">
        {row.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="whitespace-nowrap px-6 text-[11px] font-semibold uppercase tracking-widest2 text-paper/80">
              {item}
            </span>
            <span className="h-1 w-1 rounded-full bg-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}
