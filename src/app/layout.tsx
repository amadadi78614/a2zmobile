import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "A2Z Mobile & Computer Services | Mbombela, South Africa",
    template: "%s | A2Z Mobile & Computer Services",
  },
  description:
    "Bluetooth speakers, phone covers, chargers, power banks, USB fans, and hookah essentials — genuine stock with local support in Mbombela, South Africa.",
  metadataBase: new URL("https://a2z.co.za"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" >
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
