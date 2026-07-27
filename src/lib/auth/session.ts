/**
 * session.ts — Sesión actual y guardia de rutas (lado servidor).
 *
 * getUsuarioActual: quién está logueado + su rol (o null).
 * requireUser: para Server Components de rutas protegidas; redirige a /login
 * si no hay sesión, y a la ruta de su rol si el rol no está permitido.
 */
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRutaPostLogin } from "@/lib/config/experiencia";
import type { Rol } from "@/lib/domain/tipos";

export type UsuarioActual = {
  id: string;
  rol: Rol;
  email: string | null;
};

/** Usuario logueado con su rol, o null si no hay sesión válida. */
export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // RLS permite a cada quien leer su propio perfil.
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (!perfil) return null;

  return { id: user.id, rol: perfil.rol as Rol, email: user.email ?? null };
}

/**
 * Exige sesión (y opcionalmente ciertos roles). Nunca retorna null:
 * redirige antes. Usar al inicio de un Server Component protegido.
 */
export async function requireUser(roles?: Rol[]): Promise<UsuarioActual> {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  if (roles && !roles.includes(usuario.rol)) {
    redirect(getRutaPostLogin(usuario.rol));
  }
  return usuario;
}
