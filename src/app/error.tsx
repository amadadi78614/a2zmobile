"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ServerCrash } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side errors (including ProductServiceError from src/lib/products/queries.ts) are
    // already logged where they're thrown. This client-side log catches anything that reaches
    // the boundary itself, plus the digest Next.js assigns for correlating with server logs.
    console.error("[error boundary]", error.message, error.digest ? `(digest: ${error.digest})` : "");
  }, [error]);

  return (
    <div className="container-content flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <ServerCrash size={48} className="text-ink-300" strokeWidth={1.5} />
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">We&apos;re having trouble loading the store</h1>
      <p className="mt-2 max-w-md text-sm text-ink-400">
        Something went wrong on our end — this isn&apos;t a problem with your connection. Please try
        again in a moment.
      </p>
      <div className="mt-10 flex gap-4">
        <button onClick={reset} className="btn-primary">Try Again</button>
        <Link href="/" className="btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}
