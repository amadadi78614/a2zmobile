import "server-only";
import { createClient } from "@/lib/supabase/server";
import { AdminRole } from "@/lib/types";

export async function writeAuditLog(entry: {
  actorId: string;
  actorRole: AdminRole;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    actor_role: entry.actorRole,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    before: entry.before ?? null,
    after: entry.after ?? null,
  });
  // Audit logging failures should not silently vanish, but should also
  // never block the primary action from completing — log to server console
  // so it surfaces in deployment logs / monitoring.
  if (error) {
    console.error("[audit_log] failed to write entry:", entry.action, error.message);
  }
}
