import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq/FaqAccordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about ordering, delivery, payment, and returns at A2Z Mobile & Computer Services.",
};

const groups = [
  {
    title: "Ordering",
    items: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "Yes — an account is required to check out so we can attach your order to your order history, delivery tracking, and returns. Creating one only takes a minute, and you can start it from the checkout page at any time.",
      },
      {
        question: "How do I know if a product will fit my phone?",
        answer:
          "Compatible devices are listed on each product page. If you're not sure, search by your phone model in the search bar, or send us a WhatsApp message with your device and we'll confirm before you order.",
      },
      {
        question: "Can I change or cancel my order after placing it?",
        answer:
          "Contact us as soon as possible via WhatsApp or phone with your order number. If it hasn't been packed for dispatch yet, we can usually amend or cancel it. Once an order is shipped or ready for collection, please use our returns process instead.",
      },
    ],
  },
  {
    title: "Delivery & Collection",
    items: [
      {
        question: "How fast is delivery?",
        answer:
          "Nationwide courier delivery typically takes 2–4 working days from dispatch. Orders placed before 1pm in our local Mbombela/Nelspruit zone are usually delivered same-day.",
      },
      {
        question: "What does delivery cost?",
        answer:
          "Nationwide courier delivery is a flat R120. Local same-day delivery in our Mbombela/Nelspruit zone is a flat R75. Store collection is free — you'll be notified by SMS or email as soon as your order is ready to collect.",
      },
      {
        question: "Can I track my order?",
        answer:
          <>Yes — use our <Link href="/track-order" className="font-medium text-ink underline underline-offset-4">order tracking page</Link>, or check your order status any time from your account.</>,
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept secure card and instant EFT payments through PayFast, as well as manual EFT. Your order remains pending until a manual EFT payment is confirmed on our side.",
      },
      {
        question: "Is it safe to pay on your site?",
        answer:
          "Yes. Card payments are processed by PayFast, a PCI-DSS compliant payment gateway used by thousands of South African retailers. A2Z never sees or stores your card details.",
      },
    ],
  },
  {
    title: "Returns & Warranty",
    items: [
      {
        question: "What's your returns policy?",
        answer:
          <>Unopened, unused items can be returned within 7 days of delivery. Full details are on our <Link href="/returns" className="font-medium text-ink underline underline-offset-4">returns policy page</Link>.</>,
      },
      {
        question: "Do products come with a warranty?",
        answer:
          "Yes — warranty terms vary by product and are listed on each product page. All items are genuine stock sourced through authorised distributors, so manufacturer warranties apply where offered.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Support</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-500 sm:text-base">
          Can&apos;t find what you&apos;re after?{" "}
          <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
            Get in touch
          </Link>{" "}
          — WhatsApp is usually the quickest way to reach us.
        </p>
      </div>

      <FaqAccordion groups={groups} />
    </div>
  );
}
