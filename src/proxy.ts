import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Convención "proxy" de Next 16 (reemplaza al viejo "middleware").
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas salvo:
     * - _next/static, _next/image (assets)
     * - favicon y archivos estáticos comunes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
