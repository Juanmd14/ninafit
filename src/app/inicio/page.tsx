/**
 * /inicio — Home del/de la miembro: dashboard de mosaicos (según el mockup
 * de la clienta). Arriba la ficha (nombre + N° + estado); debajo la grilla:
 * "Cuota y pagos" es REAL (estado derivado en vivo); el resto (rutina, plan
 * nutricional, medidas, anuncios) son módulos futuros → mosaico "Próximamente".
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";
import { ETIQUETA_ESTADO, type EstadoMiembro } from "@/lib/domain/tipos";

const PILL: Record<EstadoMiembro, string> = {
  al_dia: "pill-ok",
  suspendida: "pill-bad",
  en_pausa: "pill-idle",
};

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

export default async function InicioPage() {
  const usuario = await requireUser(["miembro"]);
  const supabase = await createClient();

  const { data: miembro } = await supabase
    .from("vista_miembros_estado")
    .select("nombre, apellido, numero_miembro, estado")
    .eq("perfil_id", usuario.id)
    .single();

  const { count: novedadesCount } = await supabase
    .from("novedades")
    .select("id", { count: "exact", head: true })
    .eq("publicada", true);

  if (!miembro) {
    return (
      <div className="screen">
        <div className="screen-pad" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 14 }}>
          <span className="brand-mark" style={{ width: 48, height: 48, fontSize: 26, borderRadius: 14 }}>N</span>
          <p className="screen-note">Todavía no encontramos tu ficha. Avisá en el gimnasio.</p>
          <form action={cerrarSesion}><button type="submit" className="btn btn-ghost">Cerrar sesión</button></form>
        </div>
      </div>
    );
  }

  const estado = miembro.estado as EstadoMiembro;
  const alDia = estado === "al_dia";

  return (
    <div className="screen has-bottomnav">
      <header className="appbar">
        <span className="appbar-brand" style={{ paddingLeft: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={30} height={30} style={{ objectFit: "contain" }} />
        </span>
        <div className="appbar-title">NiNa&apos;S HIIT</div>
        <form action={cerrarSesion} className="appbar-action">
          <button type="submit" className="appbar-btn" aria-label="Salir">⎋</button>
        </form>
      </header>

      <div className="screen-pad">
        {/* Ficha del miembro */}
        <div className="perfil-card">
          <span className="perfil-avatar">{iniciales(miembro.nombre, miembro.apellido)}</span>
          <div className="perfil-body">
            <span className="perfil-name">{miembro.nombre} {miembro.apellido}</span>
            <span className="perfil-meta">N° de miembro <b className="mono">#{miembro.numero_miembro}</b></span>
          </div>
          <span className={`pill ${PILL[estado] ?? "pill-idle"}`}>
            <span className="pill-dot" />
            {ETIQUETA_ESTADO[estado] ?? estado}
          </span>
        </div>

        {/* Mosaicos */}
        <div className="tiles">
          <TileSoon icon={<IconPesa />} label="Rutina personalizada" />
          <TileSoon icon={<IconNutricion />} label="Plan nutricional" />
          <TileSoon icon={<IconRegla />} label="Medidas y peso" />

          {/* Cuota — REAL */}
          <Link href="/inicio/cuota" className="tile">
            <span className="tile-ic"><IconBilletera /></span>
            <span className="tile-tx">
              <span className="tile-label">Cuota y pagos</span>
              <span className={`tile-sub ${alDia ? "ok" : "bad"}`}>
                {alDia ? "Estás al día" : "Cuota pendiente"}
              </span>
            </span>
          </Link>

          {/* Anuncios — REAL, ancho completo */}
          <Link href="/inicio/novedades" className="tile tile-wide">
            <span className="tile-ic">
              <IconMegafono />
              {!!novedadesCount && <span className="tile-badge">{novedadesCount}</span>}
            </span>
            <span className="tile-tx">
              <span className="tile-label">Anuncios y novedades</span>
              <span className="tile-sub">
                {novedadesCount ? `${novedadesCount} aviso${novedadesCount === 1 ? "" : "s"} del gimnasio` : "Avisos del gimnasio"}
              </span>
            </span>
            <span className="row-link-chev">›</span>
          </Link>
        </div>
      </div>

      {/* Barra inferior (como el mockup) */}
      <nav className="bottomnav">
        <span className="bn-item active"><IconHome /><span>Inicio</span></span>
        <Link href="/inicio/cuota" className="bn-item"><IconBilletera /><span>Cuota</span></Link>
        <form action={cerrarSesion} style={{ flex: 1 }}>
          <button type="submit" className="bn-item" style={{ width: "100%", background: "transparent", border: "none" }}>
            <IconSalir /><span>Salir</span>
          </button>
        </form>
      </nav>
    </div>
  );
}

/* Mosaico "Próximamente" (no navega). */
function TileSoon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="tile is-soon" aria-disabled="true">
      <span className="tile-ic">{icon}</span>
      <span className="tile-tx">
        <span className="tile-label">{label}</span>
      </span>
      <span className="tile-soon">Pronto</span>
    </div>
  );
}

/* ── Íconos inline (sin dependencias) ── */
const svg = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
function IconPesa() { return <svg {...svg}><path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10" /></svg>; }
function IconNutricion() { return <svg {...svg}><path d="M9 8.5C7 8.5 5.5 10 5.5 12.5S7.5 19 9.5 19c.9 0 1.4-.5 2.5-.5s1.6.5 2.5.5c2 0 4-4 4-6.5S16.5 8.5 14.5 8.5c-1 0-1.7.5-2.5.5s-1.5-.5-2.5-.5Z" /><path d="M12 8.5V6c.3-1.4 1.6-2 2.8-1.6" /></svg>; }
function IconRegla() { return <svg {...svg}><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></svg>; }
function IconBilletera() { return <svg {...svg}><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5" /><circle cx="16.5" cy="12" r="1.2" fill="currentColor" stroke="none" /></svg>; }
function IconMegafono() { return <svg {...svg}><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1ZM15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14" /></svg>; }
function IconHome() { return <svg {...svg} width={20} height={20}><path d="M3 11l9-7 9 7M5 10v9h5v-5h4v5h5v-9" /></svg>; }
function IconSalir() { return <svg {...svg} width={20} height={20}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h10" /></svg>; }
