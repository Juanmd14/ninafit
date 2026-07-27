"use server";

/**
 * actions.ts — Publicar una novedad/aviso del gimnasio (solo admin).
 * Escribe en `novedades` (queda visible para los miembros). Usa service_role,
 * así que primero verificamos a mano que el actor es admin.
 */
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioActual } from "@/lib/auth/session";
import { getLugarAnfitrionId } from "@/lib/config/experiencia";

export type EstadoNovedad = { error: string | null; ok: boolean };

export async function publicarNovedad(
  _prev: EstadoNovedad,
  formData: FormData,
): Promise<EstadoNovedad> {
  const actor = await getUsuarioActual();
  if (!actor || actor.rol !== "admin") {
    return { error: "No tenés permiso.", ok: false };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const cuerpo = String(formData.get("cuerpo") ?? "").trim();
  if (!titulo || !cuerpo) {
    return { error: "Completá el título y el mensaje.", ok: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("novedades").insert({
    lugar_id: getLugarAnfitrionId(),
    titulo,
    cuerpo,
    publicada: true,
    created_by: actor.id,
  });
  if (error) return { error: "No se pudo publicar. Probá de nuevo.", ok: false };

  revalidatePath("/admin/novedades");
  revalidatePath("/inicio/novedades");
  revalidatePath("/inicio");
  return { error: null, ok: true };
}

/** Borra una novedad publicada (solo admin). */
export async function eliminarNovedad(id: string): Promise<void> {
  const actor = await getUsuarioActual();
  if (!actor || actor.rol !== "admin") return;

  const admin = createAdminClient();
  await admin.from("novedades").delete().eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/inicio/novedades");
  revalidatePath("/inicio");
}
