/**
 * /inicio/cuota — Detalle de la cuota del/de la miembro.
 * Muestra el estado derivado (al día / suspendida / en pausa). El pago es
 * presencial en el gimnasio (lo registra el admin), por eso no hay checkout.
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ETIQUETA_ESTADO, type EstadoMiembro } from "@/lib/domain/tipos";

const ESTADO_UI: Record<
  EstadoMiembro,
  { clase: string; icono: string; lead: string; sub: string; pill: string }
> = {
  al_dia: { clase: "is-ok", icono: "✓", lead: "Estás al día", sub: "Tu cuota de este mes está paga. ¡A entrenar!", pill: "pill-ok" },
  suspendida: { clase: "is-bad", icono: "!", lead: "Tu cuota está pendiente", sub: "Acercate al gimnasio para regularizarla y seguir entrenando.", pill: "pill-bad" },
  en_pausa: { clase: "is-idle", icono: "‖", lead: "Tu membresía está en pausa", sub: "Cuando quieras retomar, avisanos en el gimnasio.", pill: "pill-idle" },
};

export default async function CuotaPage() {
  const usuario = await requireUser(["miembro"]);
  const supabase = await createClient();

  const { data: miembro } = await supabase
    .from("vista_miembros_estado")
    .select("numero_miembro, estado")
    .eq("perfil_id", usuario.id)
    .single();

  const estado = (miembro?.estado ?? "suspendida") as EstadoMiembro;
  const ui = ESTADO_UI[estado] ?? ESTADO_UI.suspendida;

  return (
    <div className="screen">
      <header className="appbar">
        <Link href="/inicio" className="appbar-btn" aria-label="Volver">‹</Link>
        <div className="appbar-title">Mi cuota</div>
        <span />
      </header>

      <div className="screen-pad">
        <div className={`estado-banner ${ui.clase}`}>
          <div className="estado-ic" aria-hidden>{ui.icono}</div>
          <div className="estado-tx">
            <span className="estado-lead">{ui.lead}</span>
            <span className="estado-sub">{ui.sub}</span>
          </div>
          <span className={`pill ${ui.pill}`}>
            <span className="pill-dot" />
            {ETIQUETA_ESTADO[estado] ?? estado}
          </span>
        </div>

        <div className="receipt">
          <div className="receipt-row"><span>N° de miembro</span><b className="mono">#{miembro?.numero_miembro ?? "—"}</b></div>
          <div className="receipt-row"><span>Cómo pagás</span><b>En el gimnasio</b></div>
        </div>

        <p className="screen-note">El pago se registra en el mostrador del gimnasio. Apenas lo cargan, tu estado se actualiza acá.</p>
      </div>
    </div>
  );
}
