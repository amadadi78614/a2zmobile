import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How A2Z Mobile & Computer Services collects, uses, and protects your personal information.",
};

// NOTE for the business owner: this is a general-purpose starting policy written to reflect
// what the storefront code actually collects and does (Supabase auth/accounts, PayFast
// payments, order/delivery data, no ad tracking or data reselling observed in the codebase).
// It is not a substitute for review by a South African attorney familiar with POPIA before
// this page is relied on in production.

export default function PrivacyPage() {
  return (
    <div className="container-content py-14 md:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-xs text-ink-400">Last updated: {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-10 flex flex-col gap-10 text-sm leading-relaxed text-ink-500">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. Who we are</h2>
            <p className="mt-3">
              A2Z Mobile &amp; Computer Services (&quot;A2Z&quot;, &quot;we&quot;, &quot;us&quot;)
              operates this website and processes personal information in accordance with the
              Protection of Personal Information Act, 2013 (POPIA).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. Information we collect</h2>
            <p className="mt-3">When you create an account, place an order, or contact us, we may collect:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Your name, email address and phone number</li>
              <li>Delivery and, where applicable, billing address</li>
              <li>Order history and the products you&apos;ve purchased or returned</li>
              <li>Account credentials, handled securely through our authentication provider</li>
              <li>Basic technical information (such as browser type) needed to operate the site securely</li>
            </ul>
            <p className="mt-3">
              We do not collect or store your card details — payments are processed directly by
              PayFast, our payment gateway partner.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. How we use your information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>To process and deliver your orders</li>
              <li>To manage your account, order history and returns</li>
              <li>To respond to enquiries and provide customer support</li>
              <li>To send order-related communication (confirmations, delivery updates, returns status)</li>
              <li>To improve the website and troubleshoot issues</li>
            </ul>
            <p className="mt-3">
              We will only send you marketing communication (such as newsletters or promotions)
              if you&apos;ve opted in, and you can opt out at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. Who we share information with</h2>
            <p className="mt-3">
              We share only what&apos;s necessary to fulfil your order: our payment gateway
              (PayFast) to process payment, and our courier partners to deliver your order. We do
              not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. How we protect your information</h2>
            <p className="mt-3">
              Your account and order data is stored with industry-standard security controls,
              including encrypted connections and access restrictions. Payment details are never
              handled or stored directly by A2Z.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. Your rights</h2>
            <p className="mt-3">Under POPIA, you have the right to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Access the personal information we hold about you</li>
              <li>Request that we correct or delete inaccurate information</li>
              <li>Object to certain processing, including direct marketing</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us using the details on our{" "}
              <Link href="/contact" className="font-medium text-ink underline underline-offset-4">
                contact page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. Cookies</h2>
            <p className="mt-3">
              We use essential cookies/local storage to keep your cart, wishlist and login session
              working correctly. We do not currently use third-party advertising or tracking
              cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">8. Changes to this policy</h2>
            <p className="mt-3">
              We may update this policy from time to time. Material changes will be reflected by
              updating the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">9. Contact us</h2>
            <p className="mt-3">
              Questions about this policy or your information? Reach us via our{" "}
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
