/**
 * config.ts — Reglas del login de miembros/as (documento + clave).
 *
 * Los miembros no tienen email: se los autentica con un email SINTÉTICO e
 * invisible `{dni}@{dominio}` y la clave como password de Supabase Auth (lo
 * hashea Supabase). Ese email jamás se le muestra ni lo escribe: entra con
 * documento + clave. El bloqueo por intentos vive en columnas de `miembros`
 * (intentos_fallidos / bloqueado_hasta), no en Auth.
 */
import "server-only";

/** Intentos fallidos consecutivos antes de bloquear al/la miembro. */
export const MAX_INTENTOS = 5;

/** Cuánto dura el bloqueo, en minutos, una vez alcanzado MAX_INTENTOS. */
export const BLOQUEO_MINUTOS = 15;

/** Email sintético interno de un/a miembro a partir de su documento. */
export function emailDeMiembro(dni: string): string {
  const dominio = process.env.NEXT_PUBLIC_EMAIL_DOMINIO_MIEMBROS;
  if (!dominio) {
    throw new Error(
      "Falta NEXT_PUBLIC_EMAIL_DOMINIO_MIEMBROS (dominio del email sintético).",
    );
  }
  return `${dni}@${dominio}`;
}

/**
 * Password real que se guarda en Supabase Auth para un/a miembro.
 *
 * La clave son 4 dígitos, pero Supabase exige un mínimo de 6 caracteres (piso
 * no configurable). Derivamos un password ≥6 determinístico a partir de la clave.
 * El/la miembro nunca ve esto: escribe sus 4 dígitos y punto. La seguridad frente
 * a fuerza bruta la da el bloqueo a MAX_INTENTOS, no el largo del password.
 *
 * ⚠️ Debe usarse EXACTAMENTE igual en el alta (ABM) y en el login. Si se
 * cambia el algoritmo, todos los PIN existentes dejan de validar.
 */
export function passwordDePin(pin: string): string {
  return `nfpin:${pin}`;
}
