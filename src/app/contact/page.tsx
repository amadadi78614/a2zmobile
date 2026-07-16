import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with A2Z Mobile & Computer Services — Mbombela, South Africa.",
};

// NOTE: phone/WhatsApp number and street address below are placeholders matching the
// existing placeholder pattern already used in ProductPurchasePanel (wa.me/27000000000).
// Replace with the real store details before this page goes live.
const WHATSAPP_NUMBER = "27000000000";
const PHONE_DISPLAY = "+27 00 000 0000";
const EMAIL = "hello@a2z.co.za";

const channels = [
  {
    icon: MapPin,
    title: "Visit the store",
    body: "A2Z Mobile & Computer Services, Mbombela CBD, Mpumalanga, South Africa",
  },
  {
    icon: Phone,
    title: "Call us",
    body: PHONE_DISPLAY,
    href: `tel:${WHATSAPP_NUMBER}`,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "Fastest way to reach us — stock queries, order help, compatibility questions.",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
  {
    icon: Mail,
    title: "Email",
    body: EMAIL,
    href: `mailto:${EMAIL}`,
  },
];

export default function ContactPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Contact</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          We&apos;re easy to reach.
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-ink-500 sm:text-base">
          Stock question, order issue, or not sure if something fits your device? WhatsApp is the
          fastest way to get a real answer from someone who knows the products. In-store visits
          and phone calls are always welcome too.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {channels.map(({ icon: Icon, title, body, href }) => {
          const content = (
            <div className="flex h-full flex-col gap-3 border border-line p-6 transition-colors hover:border-ink">
              <Icon size={22} className="text-secondary" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-400">{body}</p>
            </div>
          );
          return href ? (
            <a key={title} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block">
              {content}
            </a>
          ) : (
            <div key={title}>{content}</div>
          );
        })}
      </div>

      <div className="mt-14 flex items-start gap-3 border-t border-line pt-10">
        <Clock size={20} className="mt-0.5 shrink-0 text-secondary" strokeWidth={1.75} />
        <div>
          <h2 className="text-sm font-semibold">Store hours</h2>
          <p className="mt-1 text-sm text-ink-400">Monday – Friday: 08:30 – 17:00</p>
          <p className="text-sm text-ink-400">Saturday: 08:30 – 13:00</p>
          <p className="text-sm text-ink-400">Sunday &amp; public holidays: Closed</p>
        </div>
      </div>
    </div>
  );
}
