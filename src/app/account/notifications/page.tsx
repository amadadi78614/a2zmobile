"use client";

const preferences = [
  { id: "order-updates", label: "Order status updates", description: "Shipping, delivery and collection notices", defaultChecked: true },
  { id: "deals", label: "Deals & promotions", description: "Flash sales and limited-time offers", defaultChecked: true },
  { id: "new-arrivals", label: "New arrivals", description: "New products in categories you follow", defaultChecked: false },
  { id: "restock", label: "Back-in-stock alerts", description: "When wishlist items come back into stock", defaultChecked: true },
];

export default function NotificationsPage() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide">Notification Preferences</h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {preferences.map((p) => (
          <label key={p.id} className="flex items-center justify-between gap-6 py-5">
            <div>
              <p className="text-sm font-medium">{p.label}</p>
              <p className="mt-1 text-xs text-ink-400">{p.description}</p>
            </div>
            <input type="checkbox" defaultChecked={p.defaultChecked} className="h-5 w-5 shrink-0 accent-ink" />
          </label>
        ))}
      </div>
    </div>
  );
}
