/**
 * admin.ts — Cliente de Supabase con SERVICE ROLE.
 *
 * ⚠️ SOLO servidor. Saltea RLS y tiene permisos totales.
 * Se usa para operaciones que solo el admin puede hacer y que necesitan
 * la Admin API de Auth: alta de miembros, reset de clave.
 * Nunca importar esto desde un Client Component.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY (solo servidor).");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
