/**
 * /inicio — Carnet digital del/de la miembro.
 * Muestra identidad (nombre, N° de miembro) + estado de cuota DERIVADO
 * (al_dia / suspendida / en_pausa, calculado en vivo por la vista).
 * El pago es presencial en el gimnasio (el admin lo registra); por eso acá
 * no hay checkout: el carnet informa el estado y dónde regularizar.
 */
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";
import { ETIQUETA_ESTADO, type EstadoMiembro } from "@/lib/domain/tipos";

/** Presentación de cada estado en el banner del carnet. */
const ESTADO_UI: Record<
  EstadoMiembro,
  { clase: string; icono: React.ReactNode; lead: string; sub: string; pill: string }
> = {
  al_dia: {
    clase: "is-ok",
    icono: <IconCheck />,
    lead: "Estás al día",
    sub: "Tu cuota de este mes está paga. ¡A entrenar!",
    pill: "pill-ok",
  },
  suspendida: {
    clase: "is-bad",
    icono: <IconClock />,
    lead: "Tu cuota está pendiente",
    sub: "Acercate al gimnasio para regularizarla y seguir entrenando.",
    pill: "pill-bad",
  },
  en_pausa: {
    clase: "is-idle",
    icono: <IconPause />,
    lead: "Tu membresía está en pausa",
    sub: "Cuando quieras retomar, avisanos en el gimnasio.",
    pill: "pill-idle",
  },
};

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

export default async function InicioPage() {
  const usuario = await requireUser(["miembro"]);
  const supabase = await createClient();

  // La RLS limita esta vista a la fila del/de la propia miembro.
  const { data: miembro } = await supabase
    .from("vista_miembros_estado")
    .select("nombre, apellido, numero_miembro, estado, created_at")
    .eq("perfil_id", usuario.id)
    .single();

  // Sin fila (caso borde: perfil miembro sin registro): mensaje amable.
  if (!miembro) {
    return (
      <div className="screen">
        <div className="screen-pad" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 14 }}>
          <span className="brand-mark" style={{ width: 48, height: 48, fontSize: 26, borderRadius: 14 }}>N</span>
          <p className="screen-note">Todavía no encontramos tu ficha. Avisá en el gimnasio.</p>
          <form action={cerrarSesion}>
            <button type="submit" className="btn btn-ghost">Cerrar sesión</button>
          </form>
        </div>
      </div>
    );
  }

  const estado = miembro.estado as EstadoMiembro;
  const ui = ESTADO_UI[estado] ?? ESTADO_UI.suspendida;
  const desde = new Date(miembro.created_at).getFullYear();

  return (
    <div className="screen">
      <header className="appbar">
        <span />
        <div className="appbar-title">Mi carnet</div>
        <form action={cerrarSesion} className="appbar-action">
          <button type="submit" className="appbar-btn" aria-label="Salir">⎋</button>
        </form>
      </header>

      <div className="screen-pad">
        {/* Carnet */}
        <div className="carnet">
          <div className="carnet-top">
            <span className="carnet-brand">
              <span className="brand-mark brand-mark-sm">N</span>
              Ninas Fit
            </span>
            <span className="carnet-chip">Miembro</span>
          </div>

          <div className="carnet-id">
            <span className="carnet-avatar mono">{iniciales(miembro.nombre, miembro.apellido)}</span>
            <div>
              <div className="carnet-name">{miembro.nombre} {miembro.apellido}</div>
              <div className="carnet-since">Miembro desde {desde}</div>
            </div>
          </div>

          <div className="carnet-num">
            <span className="carnet-num-lbl">N° de miembro</span>
            <span className="carnet-num-val mono">#{miembro.numero_miembro}</span>
          </div>
        </div>

        {/* Estado de cuota — legible de un vistazo */}
        <div className={`estado-banner ${ui.clase}`}>
          <div className="estado-ic">{ui.icono}</div>
          <div className="estado-tx">
            <span className="estado-lead">{ui.lead}</span>
            <span className="estado-sub">{ui.sub}</span>
          </div>
          <span className={`pill ${ui.pill}`}>
            <span className="pill-dot" />
            {ETIQUETA_ESTADO[estado] ?? estado}
          </span>
        </div>

        {/* Beneficios — teaser del módulo de comercios adheridos */}
        <div className="row-link" aria-disabled="true">
          <span className="row-link-ic"><IconGift /></span>
          <span className="row-link-tx">
            <b>Tus beneficios</b>
            <small>Descuentos en comercios adheridos · próximamente</small>
          </span>
          <span className="row-link-chev">›</span>
        </div>
      </div>
    </div>
  );
}

/* ── Íconos (inline, sin dependencias) ── */
function IconCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6v12M15 6v12" />
    </svg>
  );
}
function IconGift() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}
