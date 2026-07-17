// Test-only stub. The real "server-only" package throws when imported outside a Next.js server
// runtime, which includes Vitest's plain Node test environment — this isn't a real violation
// (tests aren't a client bundle), so vitest.config.ts aliases "server-only" to this no-op here.
export {};
