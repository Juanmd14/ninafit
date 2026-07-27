"use server";

/**
 * actions.ts — Server Actions de autenticación.
 *
 * iniciarSesion decide el camino por el identificador:
 *  - solo dígitos  → miembro/a (documento + clave, email sintético interno,
 *                    bloqueo por intentos)
 *  - lo demás      → admin/comercio (email + password)
 * En éxito redirige a la ruta del rol (getRutaPostLogin).
 */
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRutaPostLogin } from "@/lib/config/experiencia";
import {
  BLOQUEO_MINUTOS,
  MAX_INTENTOS,
  emailDeMiembro,
  passwordDePin,
} from "@/lib/auth/config";
import type { Rol } from "@/lib/domain/tipos";
import type { EstadoLogin } from "./tipos";

type Resultado = { ok: true; rol: Rol } | { ok: false; error: string };

/**
 * Atajo de demo: escribir "admin" como usuario entra a la cuenta admin usando
 * un PIN corto (mismo mecanismo derivado que los miembros: passwordDePin).
 * Facilita mostrar el panel sin tipear un email largo.
 */
const USUARIO_ADMIN_ATAJO = "admin";
const EMAIL_ADMIN_ATAJO =
  process.env.NEXT_PUBLIC_EMAIL_ADMIN ?? "admin@ninasfit.app";

export async function iniciarSesion(
  _prev: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const identificador = String(formData.get("identificador") ?? "").trim();
  const secreto = String(formData.get("secreto") ?? "");

  if (!identificador || !secreto) {
    return { error: "Completá tu usuario y tu clave." };
  }

  // Atajo "admin" + PIN → cuenta admin (clave derivada, como los miembros).
  // Documento = solo dígitos (6+). Cualquier otra cosa se trata como email.
  const esAtajoAdmin = identificador.toLowerCase() === USUARIO_ADMIN_ATAJO;
  const esDocumento = /^\d{6,}$/.test(identificador);
  const resultado = esAtajoAdmin
    ? await loginEmail(EMAIL_ADMIN_ATAJO, passwordDePin(secreto))
    : esDocumento
      ? await loginMiembro(identificador, secreto)
      : await loginEmail(identificador, secreto);

  if (!resultado.ok) return { error: resultado.error };

  // redirect() lanza una excepción especial de Next: va FUERA de try/catch.
  redirect(getRutaPostLogin(resultado.rol));
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Caminos de login
// ---------------------------------------------------------------------------

async function loginMiembro(dni: string, pin: string): Promise<Resultado> {
  const admin = createAdminClient();

  // Leemos el miembro con service_role (saltea RLS) para chequear el bloqueo
  // ANTES de intentar, sin filtrar si el documento existe o no en el mensaje.
  const { data: miembro } = await admin
    .from("miembros")
    .select("id, intentos_fallidos, bloqueado_hasta")
    .eq("dni", dni)
    .maybeSingle();

  if (miembro?.bloqueado_hasta && new Date(miembro.bloqueado_hasta) > new Date()) {
    return {
      ok: false,
      error:
        "Tu cuenta quedó bloqueada por varios intentos fallidos. Esperá unos minutos o pedí ayuda en el gimnasio.",
    };
  }

  // El PIN son 4 dígitos: si no tiene esa forma, ni consultamos a Supabase.
  if (!/^\d{4}$/.test(pin)) {
    if (miembro) {
      await registrarIntentoFallido(admin, miembro.id, miembro.intentos_fallidos);
    }
    return { ok: false, error: "Documento o clave incorrectos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailDeMiembro(dni),
    password: passwordDePin(pin),
  });

  if (error) {
    if (miembro) {
      await registrarIntentoFallido(admin, miembro.id, miembro.intentos_fallidos);
    }
    return { ok: false, error: "Documento o clave incorrectos." };
  }

  // Éxito: limpiamos el contador de intentos.
  if (miembro) {
    await admin
      .from("miembros")
      .update({ intentos_fallidos: 0, bloqueado_hasta: null })
      .eq("id", miembro.id);
  }
  return { ok: true, rol: "miembro" };
}

async function loginEmail(email: string, password: string): Promise<Resultado> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: "Email o contraseña incorrectos." };
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", data.user.id)
    .single();

  return { ok: true, rol: (perfil?.rol ?? "miembro") as Rol };
}

async function registrarIntentoFallido(
  admin: SupabaseClient,
  miembroId: string,
  actuales: number | null,
): Promise<void> {
  const intentos = (actuales ?? 0) + 1;
  const bloqueado =
    intentos >= MAX_INTENTOS
      ? new Date(Date.now() + BLOQUEO_MINUTOS * 60_000).toISOString()
      : null;

  await admin
    .from("miembros")
    .update({ intentos_fallidos: intentos, bloqueado_hasta: bloqueado })
    .eq("id", miembroId);
}
