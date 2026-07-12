export function Newsletter() {
  return (
    <section className="bg-ink py-16 text-paper md:py-20">
      <div className="container-content flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <h2 className="max-w-sm font-display text-2xl font-semibold sm:text-3xl">
            Get early access to deals and new arrivals.
          </h2>
          <p className="mt-2 text-sm text-paper/60">No spam. Unsubscribe any time.</p>
        </div>
        <form className="flex w-full max-w-md gap-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-paper/20 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-paper/40 focus:border-primary"
          />
          <button type="submit" className="shrink-0 bg-primary px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-paper">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
