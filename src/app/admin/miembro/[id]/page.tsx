/**
 * /admin/miembro/[id] — Detalle de un/a miembro para el admin.
 * Muestra identidad + estado de cuota derivado y permite REGISTRAR EL PAGO
 * del período actual (el estado se recalcula solo en la vista).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  ETIQUETA_ESTADO,
  MONTO_CUOTA_DEFECTO,
  nombrePeriodo,
  type EstadoMiembro,
} from "@/lib/domain/tipos";
import { registrarPago, revertirPago } from "./actions";

const PILL: Record<EstadoMiembro, string> = {
  al_dia: "pill-ok",
  suspendida: "pill-bad",
  en_pausa: "pill-idle",
};

function periodoActual(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-01`;
}

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function pesos(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

export default async function MiembroDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: miembro } = await supabase
    .from("vista_miembros_estado")
    .select("id, nombre, apellido, dni, telefono, numero_miembro, estado")
    .eq("id", id)
    .single();

  if (!miembro) notFound();

  const periodo = periodoActual();
  const { data: cuota } = await supabase
    .from("cuotas")
    .select("estado, monto_esperado")
    .eq("miembro_id", id)
    .eq("periodo", periodo)
    .maybeSingle();

  const estado = miembro.estado as EstadoMiembro;
  const pagada = cuota?.estado === "pagada";
  const monto = cuota?.monto_esperado ?? MONTO_CUOTA_DEFECTO;

  const registrar = registrarPago.bind(null, id);
  const revertir = revertirPago.bind(null, id);

  return (
    <div className="screen">
      <header className="appbar">
        <Link href="/admin" className="appbar-btn" aria-label="Volver">‹</Link>
        <div className="appbar-title">Miembro</div>
        <span />
      </header>

      <div className="screen-pad">
        {/* Identidad */}
        <div className="padron-row" style={{ padding: "14px 15px" }}>
          <span className="monogram padron-mono">{iniciales(miembro.nombre, miembro.apellido)}</span>
          <div className="padron-body">
            <div className="padron-name" style={{ fontSize: 16 }}>{miembro.nombre} {miembro.apellido}</div>
            <div className="padron-meta">
              <span className="mono">#{miembro.numero_miembro}</span> · Doc {miembro.dni}
              {miembro.telefono ? <> · {miembro.telefono}</> : null}
            </div>
          </div>
          <span className={`pill ${PILL[estado] ?? "pill-idle"}`}>
            <span className="pill-dot" />
            {ETIQUETA_ESTADO[estado] ?? estado}
          </span>
        </div>

        {/* Cuota del período actual */}
        <div className="section">
          <h2 className="section-title">Cuota de {nombrePeriodo(periodo)}</h2>
        </div>

        <div className="receipt">
          <div className="receipt-row"><span>Monto</span><b>{pesos(monto)}</b></div>
          <div className="receipt-row">
            <span>Estado del pago</span>
            <b style={{ color: pagada ? "var(--ok-ink)" : "var(--bad-ink)" }}>
              {pagada ? "Pagada" : "Pendiente"}
            </b>
          </div>
        </div>

        {pagada ? (
          <>
            <div className="estado-banner is-ok">
              <div className="estado-ic" aria-hidden>✓</div>
              <div className="estado-tx">
                <span className="estado-lead">Pago registrado</span>
                <span className="estado-sub">El miembro figura al día este mes.</span>
              </div>
            </div>
            <form action={revertir}>
              <button type="submit" className="btn btn-ghost btn-block">
                Marcar como impago (corregir)
              </button>
            </form>
          </>
        ) : (
          <form action={registrar}>
            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Registrar pago de {nombrePeriodo(periodo)} · {pesos(monto)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
