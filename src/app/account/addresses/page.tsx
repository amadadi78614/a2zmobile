"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { mockAddresses } from "@/lib/data/orders";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Saved Addresses</h2>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 text-sm font-medium hover:text-secondary">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {showForm && (
        <form
          className="mt-6 grid grid-cols-1 gap-4 border border-line p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setShowForm(false);
          }}
        >
          <input required placeholder="Label (e.g. Home)" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input required placeholder="Recipient name" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input required placeholder="Phone" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input required placeholder="Address line 1" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink sm:col-span-2" />
          <input placeholder="Suburb" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input required placeholder="City" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input required placeholder="Province" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input required placeholder="Postal code" className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex flex-col gap-3 border border-line p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                {addr.label}
                {addr.isDefault && <Star size={12} className="fill-primary text-primary" />}
              </span>
              <div className="flex gap-3 text-ink-400">
                <button aria-label="Edit address" className="hover:text-ink">
                  <Pencil size={14} />
                </button>
                <button
                  aria-label="Delete address"
                  onClick={() => setAddresses((a) => a.filter((x) => x.id !== addr.id))}
                  className="hover:text-secondary"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-ink-400">
              {addr.recipientName}
              <br />
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.city}, {addr.province} {addr.postalCode}
              <br />
              {addr.phone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
