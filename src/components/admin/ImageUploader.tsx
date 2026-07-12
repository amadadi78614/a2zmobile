"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, GripVertical, Star, Link as LinkIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    if (!SUPABASE_CONFIGURED) {
      setError("Connect Supabase to enable file upload — paste an image URL below in the meantime.");
      return;
    }

    const files = Array.from(fileList);
    const invalid = files.find((f) => !f.type.startsWith("image/"));
    if (invalid) {
      setError(`"${invalid.name}" isn't an image file.`);
      return;
    }
    const tooLarge = files.find((f) => f.size > MAX_FILE_BYTES);
    if (tooLarge) {
      setError(`"${tooLarge.name}" is over 5MB — compress it before uploading.`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlDraft("");
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...images];
    const [item] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, item);
    onChange(next);
    setDragIndex(null);
  }

  return (
    <div>
      <label className="text-xs font-medium text-ink-500">Product Images</label>
      <p className="mt-1 text-xs text-ink-400">
        First image is the primary photo shown on cards and search results. Drag to reorder, or use the star to
        promote an image to primary.
      </p>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className={cn(
                "group relative aspect-square cursor-grab overflow-hidden border bg-mist active:cursor-grabbing",
                i === 0 ? "border-ink" : "border-line"
              )}
            >
              <Image src={url} alt={`Product image ${i + 1}`} fill sizes="150px" className="object-cover" />

              <div className="absolute inset-0 flex items-start justify-between bg-ink/0 p-1.5 opacity-0 transition-opacity group-hover:bg-ink/30 group-hover:opacity-100">
                <GripVertical size={14} className="text-paper drop-shadow" />
                <div className="flex gap-1">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(i)}
                      aria-label="Make primary image"
                      className="flex h-6 w-6 items-center justify-center bg-paper/90 text-ink-500 hover:text-primary-700"
                    >
                      <Star size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    aria-label="Remove image"
                    className="flex h-6 w-6 items-center justify-center bg-paper/90 text-ink-500 hover:text-secondary"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-ink px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-paper">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-line px-4 py-2.5 text-xs font-medium text-ink-500 hover:border-ink hover:text-ink disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Uploading..." : "Upload Photos"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <span className="text-xs text-ink-400">or</span>
        <div className="flex items-center gap-2 border border-line px-3 py-2">
          <LinkIcon size={13} className="text-ink-400" />
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="Paste an image URL"
            className="w-48 bg-transparent text-xs outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      {!SUPABASE_CONFIGURED && (
        <p className="mt-2 text-xs text-primary-700">
          File upload needs Supabase connected (Storage bucket from migration 004). Paste an image URL/path above in
          the meantime.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-secondary">{error}</p>}
    </div>
  );
}
