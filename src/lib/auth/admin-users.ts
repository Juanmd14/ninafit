/**
 * admin-users.ts — Operaciones sobre usuarios de Supabase Auth (lado servidor).
 *
 * Usa la Admin API de GoTrue por `fetch` directo (NO @supabase/supabase-js:
 * su `auth.admin.createUser` no tolera las claves sb_secret_*). El endpoint
 * /auth/v1/admin/* puede devolver `bad_jwt` intermitente en proyectos nuevos,
 * así que reintentamos ante un 403.
 *
 * ⚠️ SOLO servidor: usa la SERVICE_ROLE key. Quien llame DEBE validar que el
 *    actor es admin (esto no chequea permisos).
 */
import "server-only";

type CrearOk = { id: string };
type CrearError = { error: "duplicado" | "desconocido"; detalle?: string };

function base() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  }
  return {
    url,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fetch con reintentos ante el `bad_jwt` intermitente (HTTP 403) de GoTrue. */
async function conReintento(
  path: string,
  init: RequestInit,
  tries = 5,
): Promise<Response> {
  const { url } = base();
  let ultimo!: Response;
  for (let i = 1; i <= tries; i++) {
    ultimo = await fetch(`${url}${path}`, init);
    if (ultimo.status !== 403) return ultimo;
    await sleep(400 * i);
  }
  return ultimo;
}

/** Crea un usuario de Auth (email confirmado). */
export async function crearUsuarioAuth(
  email: string,
  password: string,
): Promise<CrearOk | CrearError> {
  const { headers } = base();
  const res = await conReintento("/auth/v1/admin/users", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  if (res.ok) return { id: (await res.json()).id };

  const body = await res.json().catch(() => ({}));
  if (/exist|registered|already/i.test(JSON.stringify(body))) {
    return { error: "duplicado" };
  }
  return { error: "desconocido", detalle: JSON.stringify(body) };
}

/** Borra un usuario de Auth (best-effort, para rollback de altas fallidas). */
export async function borrarUsuarioAuth(id: string): Promise<void> {
  const { headers } = base();
  await conReintento(`/auth/v1/admin/users/${id}`, { method: "DELETE", headers });
}

/** Cambia la password (clave) de un usuario de Auth. */
export async function resetPasswordAuth(id: string, password: string): Promise<boolean> {
  const { headers } = base();
  const res = await conReintento(`/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password }),
  });
  return res.ok;
}
