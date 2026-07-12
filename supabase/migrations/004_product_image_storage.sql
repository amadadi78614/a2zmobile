-- =========================================================
-- Migration 004 — Product Image Storage
-- Additive only. Sets up a public Supabase Storage bucket for product
-- photos, with admin-only write access.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read — product photos need to be visible on the storefront
-- without authentication.
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins with product-write roles can upload/replace/delete photos.
create policy "admins upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and has_admin_role(array['owner','administrator','inventory']::admin_role[])
  );

create policy "admins update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and has_admin_role(array['owner','administrator','inventory']::admin_role[])
  );

create policy "admins delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and has_admin_role(array['owner','administrator','inventory']::admin_role[])
  );

-- =========================================================
-- Notes:
-- - File size/type limits are enforced client-side in ProductForm.tsx
--   (5MB max, image/* only) — Supabase Storage itself doesn't limit file
--   type by default, so this is a defense-in-depth item worth also setting
--   at the bucket level (Dashboard -> Storage -> product-images -> Edit
--   bucket -> allowed MIME types) once the project is live.
-- - This is plain file upload, not the full Product Capture module
--   (camera capture, in-browser crop/rotate, compression before upload) —
--   that remains a Sprint 4B item. This unblocks "add a real photo to a
--   real product" today without the polish pass.
-- =========================================================
