"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { AdminProduct } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import { deviceModels } from "@/lib/data/devices";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createProduct, updateProduct } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  slug: string;
  sku: string;
  barcode: string;
  brand: string;
  categorySlug: string;
  supplier: string;
  costPrice: string;
  price: string;
  compareAtPrice: string;
  vatInclusive: boolean;
  stock: string;
  reservedStock: string;
  weightKg: string;
  dimensionsCm: string;
  shortDescription: string;
  description: string;
  warranty: string;
  specs: { label: string; value: string }[];
  features: string[];
  colorway: string[];
  compatibleDevices: string[];
  tags: string[];
  searchKeywords: string[];
  images: string[];
  badge: string;
  isFeatured: boolean;
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
};

function toFormState(p?: AdminProduct | null): FormState {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    brand: p?.brand ?? "",
    categorySlug: p?.categorySlug ?? categories[0]?.slug ?? "",
    supplier: p?.supplier ?? "",
    costPrice: p?.costPrice?.toString() ?? "",
    price: p?.price?.toString() ?? "",
    compareAtPrice: p?.compareAtPrice?.toString() ?? "",
    vatInclusive: p?.vatInclusive ?? true,
    stock: p?.stock?.toString() ?? "0",
    reservedStock: p?.reservedStock?.toString() ?? "0",
    weightKg: p?.weightKg?.toString() ?? "",
    dimensionsCm: p?.dimensionsCm ?? "",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    warranty: p?.warranty ?? "",
    specs: p?.specs ?? [],
    features: p?.features ?? [],
    colorway: p?.colorway ?? [],
    compatibleDevices: p?.compatibleDevices ?? p?.compatibility ?? [],
    tags: p?.tags ?? [],
    searchKeywords: p?.searchKeywords ?? [],
    images: p?.images ?? [],
    badge: p?.badge ?? "",
    isFeatured: p?.isFeatured ?? false,
    status: p?.status ?? "draft",
    seoTitle: p?.seoTitle ?? "",
    seoDescription: p?.seoDescription ?? "",
    metaKeywords: p?.metaKeywords ?? "",
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ product }: { product?: AdminProduct | null }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTitleChange(value: string) {
    update("title", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  function handleSubmit(status: "draft" | "published") {
    setError(null);
    setFieldErrors({});

    const payload = {
      ...form,
      status,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock),
      reservedStock: Number(form.reservedStock || 0),
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      badge: form.badge || undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product!.id, payload)
        : await createProduct(payload);

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Section title="Basic Information">
          <Field label="Product Title" error={fieldErrors.title}>
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="URL Slug" error={fieldErrors.slug}>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              className="input font-mono text-xs"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU" error={fieldErrors.sku}>
              <input value={form.sku} onChange={(e) => update("sku", e.target.value)} className="input" />
            </Field>
            <Field label="Barcode (optional)">
              <input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" error={fieldErrors.brand}>
              <input
                list="brand-options"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className="input"
              />
              <datalist id="brand-options">
                {brands.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
            </Field>
            <Field label="Category" error={fieldErrors.categorySlug}>
              <select
                value={form.categorySlug}
                onChange={(e) => update("categorySlug", e.target.value)}
                className="input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Supplier (optional)">
            <input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} className="input" />
          </Field>
        </Section>

        <Section title="Descriptions">
          <Field label="Short Description" error={fieldErrors.shortDescription}>
            <textarea
              rows={2}
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Full Description">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Warranty">
            <input value={form.warranty} onChange={(e) => update("warranty", e.target.value)} className="input" />
          </Field>
        </Section>

        <Section title="Specifications">
          <ListEditor
            items={form.specs}
            onChange={(specs) => update("specs", specs)}
            render={(spec, onChange, onRemove) => (
              <div className="flex gap-2">
                <input
                  placeholder="Label"
                  value={spec.label}
                  onChange={(e) => onChange({ ...spec, label: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => onChange({ ...spec, value: e.target.value })}
                  className="input"
                />
                <button type="button" onClick={onRemove} className="text-ink-400 hover:text-secondary">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            newItem={{ label: "", value: "" }}
            addLabel="Add Spec"
          />
        </Section>

        <Section title="Variants & Compatibility">
          <TagListEditor label="Colourways" items={form.colorway} onChange={(v) => update("colorway", v)} />
          <div>
            <label className="text-xs font-medium text-ink-500">Compatible Devices</label>
            <p className="mt-1 text-xs text-ink-400">
              This drives both search (searching &ldquo;S22&rdquo; finds this product) and the
              &ldquo;Shop by Device&rdquo; filter — pick every model this item fits, not just one.
            </p>
            <TagListEditor
              label=""
              items={form.compatibleDevices}
              onChange={(v) => update("compatibleDevices", v)}
              placeholder="Start typing a model, e.g. Galaxy S22 Ultra..."
              suggestions={deviceModels.map((m) => m.name)}
            />
          </div>
          <TagListEditor label="Features" items={form.features} onChange={(v) => update("features", v)} />
        </Section>

        <Section title="Search & Discovery">
          <div>
            <label className="text-xs font-medium text-ink-500">Tags</label>
            <p className="mt-1 text-xs text-ink-400">Merchandising tags (e.g. &ldquo;fast-charging&rdquo;, &ldquo;waterproof&rdquo;) — searchable and used for related-product grouping.</p>
            <TagListEditor label="" items={form.tags} onChange={(v) => update("tags", v)} placeholder="Add a tag and press Enter" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Search Keywords</label>
            <p className="mt-1 text-xs text-ink-400">
              Phrases customers might type that don&apos;t appear naturally in the title — e.g. this
              product is titled &ldquo;20W Wall Charger&rdquo; but customers search &ldquo;iphone charger&rdquo;.
            </p>
            <TagListEditor label="" items={form.searchKeywords} onChange={(v) => update("searchKeywords", v)} placeholder="Add a search phrase and press Enter" />
          </div>
        </Section>

        <Section title="Images">
          <ImageUploader images={form.images} onChange={(v) => update("images", v)} />
        </Section>

        <Section title="SEO">
          <Field label="SEO Title">
            <input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} className="input" />
          </Field>
          <Field label="SEO Description">
            <textarea rows={2} value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} className="input" />
          </Field>
          <Field label="Meta Keywords">
            <input value={form.metaKeywords} onChange={(e) => update("metaKeywords", e.target.value)} className="input" />
          </Field>
        </Section>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="Status">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => update("isFeatured", e.target.checked)}
                className="accent-ink"
              />
              Featured product
            </label>
            <Field label="Badge">
              <select value={form.badge} onChange={(e) => update("badge", e.target.value)} className="input">
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Low Stock">Low Stock</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Pricing">
          <Field label="Cost Price (excl. VAT)">
            <input type="number" step="0.01" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} className="input" />
          </Field>
          <Field label="Selling Price" error={fieldErrors.price}>
            <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className="input" />
          </Field>
          <Field label="Compare-at Price" error={fieldErrors.compareAtPrice}>
            <input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} className="input" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.vatInclusive}
              onChange={(e) => update("vatInclusive", e.target.checked)}
              className="accent-ink"
            />
            Price includes VAT
          </label>
          {form.costPrice && form.price && (
            <p className="text-xs text-ink-400">
              Margin: {(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100).toFixed(1)}%
            </p>
          )}
        </Section>

        <Section title="Inventory">
          <Field label="Stock on Hand" error={fieldErrors.stock}>
            <input type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="input" />
          </Field>
          <Field label="Reserved Stock" error={fieldErrors.reservedStock}>
            <input type="number" value={form.reservedStock} onChange={(e) => update("reservedStock", e.target.value)} className="input" />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" step="0.01" value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} className="input" />
          </Field>
          <Field label="Dimensions (L x W x H cm)">
            <input value={form.dimensionsCm} onChange={(e) => update("dimensionsCm", e.target.value)} className="input" />
          </Field>
        </Section>

        {error && (
          <div className="border border-secondary/30 bg-secondary/5 p-3 text-xs text-secondary">{error}</div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleSubmit("published")}
            disabled={pending}
            className="btn-primary disabled:opacity-50"
          >
            {pending ? "Saving..." : isEdit ? "Save & Publish" : "Publish Product"}
          </button>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={pending}
            className="btn-secondary disabled:opacity-50"
          >
            Save as Draft
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e8e8e8;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: #111111;
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-paper p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-500">{label}</label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-secondary">{error[0]}</p>}
    </div>
  );
}

function TagListEditor({
  label,
  items,
  onChange,
  placeholder = "Add a value and press Enter",
  suggestions,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const listId = suggestions ? `taglist-${label.replace(/\s+/g, "-").toLowerCase() || "suggestions"}` : undefined;

  function commit() {
    const value = draft.trim();
    if (value) onChange([...items, value]);
    setDraft("");
  }

  return (
    <div>
      {label && <label className="text-xs font-medium text-ink-500">{label}</label>}
      <div className={cn("flex flex-wrap gap-2", label && "mt-2")}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 bg-mist px-2.5 py-1 text-xs">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 size={11} className="text-ink-400 hover:text-secondary" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        list={listId}
        className="input mt-2"
      />
      {suggestions && listId && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  render,
  newItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, onChange: (item: T) => void, onRemove: () => void) => React.ReactNode;
  newItem: T;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) =>
        <div key={i}>
          {render(
            item,
            (updated) => onChange(items.map((it, idx) => (idx === i ? updated : it))),
            () => onChange(items.filter((_, idx) => idx !== i))
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange([...items, newItem])}
        className={cn("flex w-fit items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink")}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}
