"use client";

/** novedad-form.tsx — Form para publicar un aviso (Client Component). */
import { useActionState, useRef, useEffect } from "react";
import { publicarNovedad, type EstadoNovedad } from "./actions";

const INICIAL: EstadoNovedad = { error: null, ok: false };

export function NovedadForm() {
  const [estado, accion, pendiente] = useActionState(publicarNovedad, INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={accion} className="section-card">
      <div className="field">
        <label className="field-label" htmlFor="titulo">Título</label>
        <input id="titulo" name="titulo" className="input" placeholder="Nuevos horarios de verano" autoComplete="off" required />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="cuerpo">Mensaje</label>
        <textarea id="cuerpo" name="cuerpo" className="input textarea" rows={3} placeholder="Contales la novedad a tus miembros…" required />
      </div>
      {estado.error && <p className="form-error">{estado.error}</p>}
      <button type="submit" className="btn btn-primary btn-block" disabled={pendiente}>
        {pendiente ? "Publicando…" : "Publicar aviso"}
      </button>
    </form>
  );
}
