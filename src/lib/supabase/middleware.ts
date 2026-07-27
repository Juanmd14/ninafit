/**
 * middleware.ts — Refresco de sesión de Supabase en cada request.
 * Mantiene las cookies de auth frescas para Server Components.
 * IMPORTANTE: no mete lógica de autorización pesada acá (RLS es la fuente
 * de verdad); solo refresca la sesión.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca el token si hace falta. No borrar: es lo que mantiene la sesión.
  await supabase.auth.getUser();

  return supabaseResponse;
}
