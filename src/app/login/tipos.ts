/**
 * tipos.ts — Contrato del estado del formulario de login.
 * Vive aparte de actions.ts porque un archivo "use server" solo puede
 * exportar funciones async (no tipos).
 */
export type EstadoLogin = { error: string | null };

export const ESTADO_LOGIN_INICIAL: EstadoLogin = { error: null };
