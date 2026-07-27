/**
 * tipos.ts — Tipos de dominio compartidos.
 *
 * Los tipos de filas de la base se van a generar con la CLI de Supabase
 * (`supabase gen types typescript`) en src/types/database.ts. Acá viven los
 * tipos "de negocio" que usa la app, estables y legibles.
 */

/** Roles de la app. Ancla de RLS (tabla `perfiles`). */
export type Rol = "admin" | "miembro" | "comercio";

/** Tipo de lugar en la tabla unificada `lugares`. */
export type TipoLugar = "gimnasio" | "comercio";

/**
 * Estado VIGENTE de un/a miembro. Es DERIVADO, nunca se guarda:
 * se calcula desde las cuotas + la fecha de hoy (ver la función SQL
 * `estado_miembro` y la vista `vista_miembros_estado`).
 */
export type EstadoMiembro = "al_dia" | "suspendida" | "en_pausa";

/**
 * Estado de una fila de `cuotas`. Guarda solo HECHOS, nunca el estado
 * derivado por tiempo. "suspendida" no existe acá: se deriva de
 * (pendiente + pasó el día 10).
 */
export type EstadoCuota = "pendiente" | "pagada" | "en_pausa" | "anulada";

/** Medios de pago del enlace externo (hoy manual; mañana webhook MP). */
export type MetodoPago =
  | "cuenta_dni"
  | "santander"
  | "mercado_pago"
  | "efectivo"
  | "otro";

/** Día del mes hasta el cual la cuota del período se considera al día. */
export const DIA_LIMITE_PAGO = 10;

/** Etiquetas en español para mostrar en la UI. */
export const ETIQUETA_ESTADO: Record<EstadoMiembro, string> = {
  al_dia: "Al día",
  suspendida: "Suspendida",
  en_pausa: "En pausa",
};
