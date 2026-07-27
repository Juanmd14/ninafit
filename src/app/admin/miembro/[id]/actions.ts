"use server";

/**
 * actions.ts — Registrar / revertir el pago de la cuota del período actual.
 *
 * El estado del/de la miembro (al_dia/suspendida) es DERIVADO: no se guarda.
 * Acá solo escribimos el HECHO en `cuotas` (estado 'pagada' o 'pendiente') para
 * el período actual; la vista recalcula el estado sola.
 *
 * Usa service_role (saltea RLS) → primero verificamos a mano que el actor es
 * admin. `marcado_por` deja rastro de quién registró el pago.
 */
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioActual } from "@/lib/auth/session";
import { MONTO_CUOTA_DEFECTO } from "@/lib/domain/tipos";

/** Primer día del mes actual, 'YYYY-MM-01' (coincide con periodo_actual en SQL). */
function periodoActual(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-01`;
}

async function requireAdmin() {
  const actor = await getUsuarioActual();
  if (!actor || actor.rol !== "admin") return null;
  return actor;
}

/** Marca la cuota del período actual como PAGADA (upsert por miembro+periodo). */
export async function registrarPago(miembroId: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;

  const admin = createAdminClient();
  await admin.from("cuotas").upsert(
    {
      miembro_id: miembroId,
      periodo: periodoActual(),
      monto_esperado: MONTO_CUOTA_DEFECTO,
      estado: "pagada",
      metodo: "efectivo",
      fecha_pago: new Date().toISOString(),
      marcado_por: actor.id,
    },
    { onConflict: "miembro_id,periodo" },
  );

  revalidatePath(`/admin/miembro/${miembroId}`);
  revalidatePath("/admin");
}

/** Vuelve la cuota del período actual a PENDIENTE (para corregir un error). */
export async function revertirPago(miembroId: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;

  const admin = createAdminClient();
  await admin.from("cuotas").upsert(
    {
      miembro_id: miembroId,
      periodo: periodoActual(),
      monto_esperado: MONTO_CUOTA_DEFECTO,
      estado: "pendiente",
      metodo: null,
      fecha_pago: null,
      marcado_por: actor.id,
    },
    { onConflict: "miembro_id,periodo" },
  );

  revalidatePath(`/admin/miembro/${miembroId}`);
  revalidatePath("/admin");
}
