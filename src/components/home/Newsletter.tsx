"use client";

import { MessageCircle } from "lucide-react";

// No email-subscription backend exists yet (and adding one is outside this sprint's scope —
// no new API routes). Rather than fake a success message on submit, the form is disabled and
// says so plainly, with a real, working WhatsApp opt-in offered as the functional alternative.
const WHATSAPP_NUMBER = "27000000000";
const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi A2Z, please add me to your deals & new arrivals updates."
)}`;

export function Newsletter() {
  return (
    <section className="bg-ink py-16 text-paper md:py-20">
      <div className="container-content flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <h2 className="max-w-sm font-display text-2xl font-semibold sm:text-3xl">
            Get early access to deals and new arrivals.
          </h2>
          <p className="mt-2 text-sm text-paper/60">
            Email sign-up is temporarily unavailable — tap below to get updates on WhatsApp instead.
          </p>
        </div>
        <form
          className="flex w-full max-w-md gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            disabled
            placeholder="Email sign-up coming soon"
            aria-disabled="true"
            className="w-full cursor-not-allowed border border-paper/20 bg-transparent px-4 py-3.5 text-sm text-paper/40 outline-none placeholder:text-paper/40"
          />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 bg-primary px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-paper"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </form>
      </div>
    </section>
  );
}
