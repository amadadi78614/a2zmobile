-- =========================================================
-- Bootstrap the first Owner admin account.
--
-- There's no UI for this by design — admin_users can only be written to
-- by an existing 'owner' (see the RLS policy in migration 002), so the
-- very first one has to be created directly in the SQL editor.
--
-- Steps:
-- 1. In the Supabase dashboard, go to Authentication → Users → Add User,
--    and create the account with the owner's real email + a password.
-- 2. Copy that user's UUID from the dashboard.
-- 3. Replace the UUID and name below, then run this in the SQL editor.
-- =========================================================

insert into admin_users (id, full_name, role, is_active)
values (
  'PASTE-THE-AUTH-USER-UUID-HERE',
  'Owner Name',
  'owner',
  true
)
on conflict (id) do update set role = 'owner', is_active = true;

-- Once this exists, the owner can sign in at /admin/login and create
-- further staff accounts the same way (Auth → Add User, then insert into
-- admin_users with the appropriate role) until Module 1's "manage admin
-- users" UI is built.
