"use server";

/**
 * actions.ts — Alta de miembro (solo admin).
 *
 * Usa service_role (Admin API de Auth + PostgREST), que SALTEA RLS, así que
 * lo primero es verificar a mano que el actor es admin. Crea el usuario de
 * Auth (documento → email sintético, clave → passwordDePin) y luego el perfil
 * y la fila de `miembros`. Si algo falla después de crear el usuario, se hace
 * rollback borrándolo.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioActual } from "@/lib/auth/session";
import { getLugarAnfitrionId } from "@/lib/config/experiencia";
import { emailDeMiembro, passwordDePin } from "@/lib/auth/config";
import {
  borrarUsuarioAuth,
  crearUsuarioAuth,
} from "@/lib/auth/admin-users";
import type { EstadoAlta } from "./tipos";

export async function crearMiembro(
  _prev: EstadoAlta,
  formData: FormData,
): Promise<EstadoAlta> {
  const actor = await getUsuarioActual();
  if (!actor || actor.rol !== "admin") {
    return { error: "No tenés permiso para dar de alta.", creado: null };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const clave = String(formData.get("clave") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  if (!nombre || !apellido) {
    return { error: "Completá el nombre y el apellido.", creado: null };
  }
  if (!/^\d{6,}$/.test(dni)) {
    return { error: "El documento debe ser numérico (6+ dígitos).", creado: null };
  }
  if (!/^\d{4}$/.test(clave)) {
    return { error: "La clave debe ser de 4 dígitos.", creado: null };
  }

  const admin = createAdminClient();

  // ¿Ya hay un miembro con ese documento?
  const { data: yaExiste } = await admin
    .from("miembros")
    .select("id")
    .eq("dni", dni)
    .maybeSingle();
  if (yaExiste) {
    return { error: "Ya hay un miembro con ese documento.", creado: null };
  }

  // 1) Usuario de Auth
  const usuario = await crearUsuarioAuth(emailDeMiembro(dni), passwordDePin(clave));
  if ("error" in usuario) {
    return {
      error:
        usuario.error === "duplicado"
          ? "Ese documento ya tiene un usuario. Revisá el padrón."
          : "No se pudo crear el usuario. Probá de nuevo.",
      creado: null,
    };
  }

  // 2) Número de miembro (siguiente disponible en el lugar)
  const numero = await siguienteNumeroMiembro(admin);

  // 3) Perfil + miembro (con rollback del usuario si algo falla)
  const { error: ePerfil } = await admin
    .from("perfiles")
    .insert({ id: usuario.id, rol: "miembro", activo: true });
  if (ePerfil) {
    await borrarUsuarioAuth(usuario.id);
    return { error: "No se pudo crear el perfil. Probá de nuevo.", creado: null };
  }

  const { error: eMiembro } = await admin.from("miembros").insert({
    perfil_id: usuario.id,
    lugar_id: getLugarAnfitrionId(),
    nombre,
    apellido,
    dni,
    telefono: telefono || null,
    numero_miembro: numero,
  });
  if (eMiembro) {
    await borrarUsuarioAuth(usuario.id); // cascade borra el perfil
    return { error: "No se pudo guardar el miembro. Probá de nuevo.", creado: null };
  }

  return {
    error: null,
    creado: { nombre, apellido, dni, numero, clave },
  };
}

/** Siguiente número de miembro del lugar anfitrión (max + 1, con ceros). */
async function siguienteNumeroMiembro(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string> {
  const { data } = await admin
    .from("miembros")
    .select("numero_miembro")
    .eq("lugar_id", getLugarAnfitrionId());

  const max = (data ?? []).reduce((m, f) => {
    const n = parseInt(f.numero_miembro as string, 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return String(max + 1).padStart(4, "0");
}
