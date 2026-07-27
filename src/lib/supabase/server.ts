/**
 * server.ts — Cliente de Supabase para el SERVIDOR
 * (Server Components, Route Handlers, Server Actions).
 * Lee/escribe la sesión en cookies. Respeta RLS (usa la anon key).
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se llamó desde un Server Component (no puede escribir cookies).
            // El middleware se encarga de refrescar la sesión.
          }
        },
      },
    },
  );
}
