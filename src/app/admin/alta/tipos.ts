/**
 * tipos.ts — Estado del formulario de alta de miembro.
 * Aparte de actions.ts porque un archivo "use server" solo exporta funciones.
 */
export type MiembroCreado = {
  nombre: string;
  apellido: string;
  dni: string;
  numero: string;
  clave: string;
};

export type EstadoAlta = {
  error: string | null;
  creado: MiembroCreado | null;
};

export const ESTADO_ALTA_INICIAL: EstadoAlta = { error: null, creado: null };
