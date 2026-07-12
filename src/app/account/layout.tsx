import { AccountNav } from "@/components/account/AccountNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-content py-10 md:py-14">
      <div className="mb-8">
        <span className="eyebrow">My Account</span>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back</h1>
      </div>
      <div className="flex flex-col gap-10 lg:flex-row">
        <AccountNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
