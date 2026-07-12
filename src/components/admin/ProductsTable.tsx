"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Trash2, Upload, Download, Archive, CheckCircle2 } from "lucide-react";
import { AdminProduct } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { formatZAR } from "@/lib/utils";
import {
  deleteProduct,
  duplicateProduct,
  bulkDeleteProducts,
  bulkUpdateStatus,
  bulkUpdatePrice,
  importProductsCsv,
} from "@/lib/admin/actions";

const statusStyles: Record<string, string> = {
  draft: "bg-mist text-ink-500",
  published: "bg-ink text-paper",
  archived: "bg-secondary/10 text-secondary",
};

export function ProductsTable({ products, canWrite }: { products: AdminProduct[]; canWrite: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.categorySlug !== categoryFilter) return false;
      if (query && !`${p.title} ${p.sku} ${p.brand}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [products, query, statusFilter, categoryFilter]);

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(fn: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await fn();
      if (!result.success) alert(result.error ?? "Action failed.");
      setSelected(new Set());
      router.refresh();
    });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    startTransition(async () => {
      const result = await importProductsCsv(text);
      if (result.success) {
        setImportSummary(
          `Imported: ${result.data.created} created, ${result.data.updated} updated, ${result.data.errors.length} errors.`
        );
      } else {
        setImportSummary(result.error);
      }
      router.refresh();
    });
    e.target.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, SKU, or brand..."
          className="w-64 border border-line px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-line px-3 py-2 text-sm outline-none">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-line px-3 py-2 text-sm outline-none">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <a href="/admin/products/export" className="flex items-center gap-2 border border-line px-3 py-2 text-xs font-medium hover:border-ink">
            <Download size={14} /> Export CSV
          </a>
          {canWrite && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-line px-3 py-2 text-xs font-medium hover:border-ink"
              >
                <Upload size={14} /> Import CSV
              </button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
              <Link href="/admin/products/new" className="btn-primary px-4 py-2 text-xs">
                + Add Product
              </Link>
            </>
          )}
        </div>
      </div>

      {importSummary && (
        <div className="mt-3 border border-line bg-mist p-3 text-xs text-ink-500">{importSummary}</div>
      )}

      {canWrite && selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 border border-ink bg-ink px-4 py-3 text-paper">
          <span className="text-xs font-medium">{selected.size} selected</span>
          <button
            onClick={() => runBulk(() => bulkUpdateStatus({ productIds: [...selected], status: "published" }))}
            className="flex items-center gap-1.5 text-xs hover:text-primary"
          >
            <CheckCircle2 size={13} /> Publish
          </button>
          <button
            onClick={() => runBulk(() => bulkUpdateStatus({ productIds: [...selected], status: "archived" }))}
            className="flex items-center gap-1.5 text-xs hover:text-primary"
          >
            <Archive size={13} /> Archive
          </button>
          <button
            onClick={() => {
              const pct = prompt("Increase price by what percentage? (e.g. 10 for +10%)");
              if (!pct) return;
              runBulk(() =>
                bulkUpdatePrice({ productIds: [...selected], mode: "increase_percent", value: Number(pct) })
              );
            }}
            className="text-xs hover:text-primary"
          >
            Bulk Price +%
          </button>
          <button
            onClick={() => {
              if (!confirm(`Delete ${selected.size} product(s)? This can be restored by an owner/admin from the database.`)) return;
              runBulk(() => bulkDeleteProducts({ productIds: [...selected] }));
            }}
            className="ml-auto flex items-center gap-1.5 text-xs text-secondary hover:text-primary"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-400">
              {canWrite && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-ink"
                  />
                </th>
              )}
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-mist/50">
                {canWrite && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="accent-ink" />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-mist">
                      {p.images[0] && <Image src={p.images[0]} alt={p.title} fill sizes="40px" className="object-cover" />}
                    </div>
                    <span className="font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-400">{p.sku}</td>
                <td className="px-4 py-3 text-ink-400">
                  {categories.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug}
                </td>
                <td className="px-4 py-3 font-medium">{formatZAR(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? "text-secondary" : p.stock <= 5 ? "text-primary-700" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium capitalize ${statusStyles[p.status]}`}>{p.status}</span>
                </td>
                {canWrite && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-ink-400">
                      <Link href={`/admin/products/${p.id}/edit`} aria-label="Edit" className="hover:text-ink">
                        <Pencil size={15} />
                      </Link>
                      <button
                        aria-label="Duplicate"
                        disabled={pending}
                        onClick={() => runBulk(() => duplicateProduct(p.id))}
                        className="hover:text-ink"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        aria-label="Delete"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`Delete "${p.title}"?`)) return;
                          runBulk(() => deleteProduct(p.id));
                        }}
                        className="hover:text-secondary"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-400">
                  No products match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
