"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide">Profile</h2>
        <form
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        >
          <div>
            <label className="text-xs font-medium text-ink-500">Full name</label>
            <input defaultValue="Mohamed A." className="mt-2 w-full border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Email</label>
            <input type="email" defaultValue="mohamed@a2z.co.za" className="mt-2 w-full border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Phone</label>
            <input defaultValue="082 555 0134" className="mt-2 w-full border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">Save Changes</button>
            {saved && <span className="ml-4 text-sm text-ink-400">Saved.</span>}
          </div>
        </form>
      </div>

      <div className="border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Change Password</h2>
        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="password" placeholder="Current password" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink sm:col-span-2" />
          <input type="password" placeholder="New password" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input type="password" placeholder="Confirm new password" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <div className="sm:col-span-2">
            <button type="submit" className="btn-secondary">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
