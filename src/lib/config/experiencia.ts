/**
 * experiencia.ts — El "interruptor de expansión".
 *
 * Este archivo es el ÚNICO lugar que decide qué es el protagonista de la app.
 *
 * HOY: Ninas Fit es el lugar anfitrión. El login de un/a miembro lo/la lleva
 *      directo a la experiencia del gimnasio.
 *
 * MAÑANA (Cadena de Eslabones): el gimnasio pasa a ser un nodo más de la red.
 *      Para expandir, se cambia SOLO este archivo (la home y la redirección),
 *      sin tocar el modelo de datos ni las queries.
 *
 * La estructura (tabla `lugares`) nunca hardcodea a Ninas Fit como centro:
 * el lugar anfitrión se identifica por su UUID vía variable de entorno.
 */

import type { Rol } from "@/lib/domain/tipos";

/** UUID de la fila de `lugares` que hoy es el gimnasio anfitrión. */
export function getLugarAnfitrionId(): string {
  const id = process.env.NEXT_PUBLIC_LUGAR_ANFITRION_ID;
  if (!id) {
    throw new Error(
      "Falta NEXT_PUBLIC_LUGAR_ANFITRION_ID. Cargá el UUID de Ninas Fit (tabla lugares).",
    );
  }
  return id;
}

/**
 * Ruta a la que se redirige después de un login exitoso, según el rol.
 * Este es el punto que se cambia para "mover el centro" de la app.
 */
export function getRutaPostLogin(rol: Rol): string {
  switch (rol) {
    case "admin":
      return "/admin";
    case "comercio":
      return "/comercio";
    case "miembro":
    default:
      // HOY: protagonista = gimnasio. MAÑANA: cambiar a "/" (home de la red).
      return "/inicio";
  }
}
