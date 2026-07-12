/**
 * Minimal RFC 4180-ish CSV parser/stringifier. Handles quoted fields,
 * embedded commas, embedded newlines, and escaped double-quotes ("").
 * No external dependency — this repo's network allowlist covers npm, but
 * keeping bulk import/export dependency-free avoids a supply-chain surface
 * for a genuinely small parsing job.
 */

export function parseCsv(text: string): Record<string, string>[] {
  const rows = parseRows(text);
  if (rows.length === 0) return [];
  const [header, ...rest] = rows;
  return rest
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const record: Record<string, string> = {};
      header.forEach((key, i) => {
        record[key.trim()] = (row[i] ?? "").trim();
      });
      return record;
    });
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const normalized = text.replace(/\r\n/g, "\n");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function toCsv(rows: Record<string, string | number | boolean | null | undefined>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

/** Column set used for product bulk import/export — keep in sync with ProductForm fields. */
export const PRODUCT_CSV_COLUMNS = [
  "sku",
  "title",
  "slug",
  "brand",
  "categorySlug",
  "price",
  "compareAtPrice",
  "costPrice",
  "stock",
  "status",
  "shortDescription",
  "warranty",
  "barcode",
  "supplier",
  "tags",
  "searchKeywords",
  "compatibleDevices",
] as const;

/** Multi-value CSV cells use ";" to separate values within a single field, e.g. "Galaxy S22;Galaxy S22 Ultra". */
export function splitMultiValue(cell: string | undefined): string[] {
  if (!cell) return [];
  return cell
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function joinMultiValue(values: string[] | undefined): string {
  return (values ?? []).join(";");
}
