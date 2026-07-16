"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = { question: string; answer: React.ReactNode };
type FaqGroup = { title: string; items: FaqItem[] };

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mt-10 flex flex-col gap-12">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="font-display text-lg font-semibold">{group.title}</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {group.items.map((item) => {
              const id = `${group.title}-${item.question}`;
              const isOpen = open === id;
              return (
                <div key={id}>
                  <button
                    onClick={() => setOpen(isOpen ? null : id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-ink"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      size={16}
                      className={cn("shrink-0 text-ink-400 transition-transform duration-200", isOpen && "rotate-180")}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid overflow-hidden transition-all duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="min-h-0">
                      <p className="text-sm leading-relaxed text-ink-500">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
