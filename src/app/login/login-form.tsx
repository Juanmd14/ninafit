"use client";

/**
 * login-form.tsx — Formulario de ingreso (Client Component).
 * Un solo par de campos sirve para los dos caminos: documento+clave (miembros)
 * o email+contraseña (admin/comercio). La lógica vive en la Server Action.
 */
import { useActionState } from "react";
import { iniciarSesion } from "./actions";
import { ESTADO_LOGIN_INICIAL } from "./tipos";

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    ESTADO_LOGIN_INICIAL,
  );

  return (
    <form action={accion} className="login-form">
      <div className="field">
        <label className="field-label" htmlFor="identificador">
          DNI o email
        </label>
        <input
          id="identificador"
          name="identificador"
          className="input"
          autoComplete="username"
          placeholder="Tu documento o tu email"
          required
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="secreto">
          PIN o contraseña
        </label>
        <input
          id="secreto"
          name="secreto"
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="••••••"
          required
        />
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}

      <button
        type="submit"
        className="btn btn-primary btn-lg btn-block"
        disabled={pendiente}
      >
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
