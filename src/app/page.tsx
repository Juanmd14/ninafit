/**
 * Home raíz: puro enrutador. Sin sesión → /login; con sesión → la ruta del rol
 * (ver lib/config/experiencia.ts, el "interruptor de expansión").
 */
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth/session";
import { getRutaPostLogin } from "@/lib/config/experiencia";

export default async function Home() {
  const usuario = await getUsuarioActual();
  redirect(usuario ? getRutaPostLogin(usuario.rol) : "/login");
}
