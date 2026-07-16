import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// `globals.css` / `tailwind.config.ts` reference `var(--font-poppins)` (display) and
// `var(--font-inter)` (body/sans), but no font was ever actually loaded to populate those
// variables — the whole site was silently rendering in the browser's default system sans-serif.
// Manrope (display) + Inter (body) are self-hosted via @fontsource (no runtime/build-time fetch
// to Google's font CDN — more resilient for CI/restricted-network builds than next/font/google)
// and bound to the same CSS variable names in globals.css, so no design-token changes were
// needed anywhere else.

export const metadata: Metadata = {
  title: {
    default: "A2Z Mobile & Computer Services | South Africa",
    template: "%s | A2Z Mobile & Computer Services",
  },
  description:
    "Bluetooth speakers, phone covers, chargers, power banks, USB fans, and hookah essentials — genuine products, fast nationwide delivery across South Africa.",
  metadataBase: new URL("https://a2z.co.za"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
