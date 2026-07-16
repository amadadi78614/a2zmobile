import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions that apply when you shop with A2Z Mobile & Computer Services.",
};

// NOTE for the business owner: same as privacy/page.tsx — a general-purpose starting policy
// reflecting the site's actual behaviour (PayFast/EFT payment, courier/collection fulfilment,
// 7-day returns as stated elsewhere on the site). Have this reviewed by a South African
// attorney before relying on it in production.

export default function TermsPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-xs text-ink-400">Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-10 flex flex-col gap-10 text-sm leading-relaxed text-ink-500">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. Acceptance of terms</h2>
            <p className="mt-3">
              By using this website and placing an order, you agree to these Terms of Service. If
              you don&apos;t agree with any part of them, please don&apos;t use the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. Products &amp; pricing</h2>
            <p className="mt-3">
              We make every effort to display accurate pricing, stock levels and product
              information. Occasionally an error may occur — if a listed price or stock level is
              wrong, we&apos;ll contact you before processing your order and you&apos;ll have the
              option to confirm at the correct price or cancel for a full refund.
            </p>
            <p className="mt-3">All prices are listed in South African Rand (ZAR).</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. Orders &amp; accounts</h2>
            <p className="mt-3">
              An account is required to place an order. You&apos;re responsible for keeping your
              account credentials secure and for the accuracy of the information you provide at
              checkout (contact details and delivery address in particular).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. Payment</h2>
            <p className="mt-3">
              We accept card and instant EFT payment via PayFast, and manual EFT. Orders paid by
              manual EFT are only processed once payment has been confirmed. Card payments are
              processed securely by PayFast — A2Z does not receive or store your card details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. Delivery &amp; collection</h2>
            <p className="mt-3">
              Delivery timeframes and costs are shown at checkout and on our{" "}
              <Link href="/shipping" className="font-medium text-ink underline underline-offset-4">
                shipping information page
              </Link>
              . Delivery estimates are provided in good faith but are not guaranteed, as they can
              be affected by courier delays outside our control.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. Returns &amp; warranty</h2>
            <p className="mt-3">
              Our return terms are set out in full on our{" "}
              <Link href="/returns" className="font-medium text-ink underline underline-offset-4">
                returns policy page
              </Link>
              . Manufacturer warranties, where applicable, are listed on individual product pages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. Acceptable use</h2>
            <p className="mt-3">
              You agree not to misuse the site — including attempting to access accounts that
              aren&apos;t yours, disrupting site functionality, or using the site for any unlawful
              purpose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">8. Limitation of liability</h2>
            <p className="mt-3">
              To the extent permitted by law, A2Z is not liable for indirect or consequential
              losses arising from use of this website. Nothing in these terms limits any
              consumer right you have under the Consumer Protection Act, 2008.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">9. Changes to these terms</h2>
            <p className="mt-3">
              We may update these terms from time to time. Continued use of the site after a
              change constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">10. Contact us</h2>
            <p className="mt-3">
              Questions about these terms? Reach us via our{" "}
              <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
