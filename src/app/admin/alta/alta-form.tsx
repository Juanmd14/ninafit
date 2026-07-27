"use client";

/**
 * alta-form.tsx — Formulario de alta de miembro (Client Component).
 * En éxito muestra un comprobante con la clave, para que el admin se la pase
 * al miembro (es lo único que necesita para entrar: documento + clave).
 */
import Link from "next/link";
import { useActionState, useState } from "react";
import { crearMiembro } from "./actions";
import { ESTADO_ALTA_INICIAL } from "./tipos";

export function AltaForm() {
  const [estado, accion, pendiente] = useActionState(
    crearMiembro,
    ESTADO_ALTA_INICIAL,
  );
  const [clave, setClave] = useState("");

  if (estado.creado) {
    const m = estado.creado;
    return (
      <div className="screen-pad success-wrap">
        <div className="success-ring" aria-hidden>✓</div>
        <h2 className="success-title">Miembro dado de alta</h2>
        <p className="success-sub">Pasale estos datos para que pueda entrar.</p>
        <div className="receipt">
          <div className="receipt-row"><span>Nombre</span><b>{m.nombre} {m.apellido}</b></div>
          <div className="receipt-row"><span>Documento</span><b className="mono">{m.dni}</b></div>
          <div className="receipt-row"><span>Clave</span><b className="mono">{m.clave}</b></div>
          <div className="receipt-row"><span>N° de miembro</span><b className="mono">#{m.numero}</b></div>
        </div>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <Link href="/admin" className="btn btn-ghost btn-block">Volver al padrón</Link>
          <Link href="/admin/alta" className="btn btn-primary btn-block">Dar de alta otro</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={accion} className="screen-pad">
      <p className="form-intro">
        Cargá los datos del nuevo miembro. Va a entrar con su <b>documento</b> y la <b>clave</b> de 4 dígitos.
      </p>

      <div className="field-2col">
        <div className="field">
          <label className="field-label" htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" className="input" autoComplete="off" required />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="apellido">Apellido</label>
          <input id="apellido" name="apellido" className="input" autoComplete="off" required />
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="dni">Documento</label>
        <input id="dni" name="dni" className="input mono" inputMode="numeric" placeholder="38043103" required />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="telefono">Teléfono <span className="field-hint">(opcional)</span></label>
        <input id="telefono" name="telefono" className="input" inputMode="tel" autoComplete="off" />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="clave">Clave (4 dígitos)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="clave"
            name="clave"
            className="input mono"
            inputMode="numeric"
            maxLength={4}
            pattern="\d{4}"
            value={clave}
            onChange={(e) => setClave(e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setClave(String(Math.floor(1000 + Math.random() * 9000)))}
          >
            Sugerir
          </button>
        </div>
        <span className="field-hint">El miembro la usa para entrar. Se la podés cambiar después.</span>
      </div>

      {estado.error && <p className="form-error">{estado.error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/admin" className="btn btn-ghost btn-block">Cancelar</Link>
        <button type="submit" className="btn btn-primary btn-block" disabled={pendiente}>
          {pendiente ? "Dando de alta…" : "Dar de alta"}
        </button>
      </div>
    </form>
  );
}
