/**
 * /admin — Panel del admin: padrón de miembros + alta.
 * (La recaudación y la edición vienen en módulos siguientes.)
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

export default async function AdminPage() {
  await requireUser(["admin"]);

  const supabase = await createClient();
  const { data: miembros } = await supabase
    .from("vista_miembros_estado")
    .select("id, nombre, apellido, dni, numero_miembro, estado")
    .order("numero_miembro");

  const lista = miembros ?? [];

  // Panel de control: al día vs total + recaudación del mes en curso.
  const hoy = new Date();
  const periodo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
  const alDia = lista.filter((m) => m.estado === "al_dia").length;
  const { data: pagadas } = await supabase
    .from("cuotas")
    .select("monto_esperado")
    .eq("periodo", periodo)
    .eq("estado", "pagada");
  const recaudado = (pagadas ?? []).reduce((s, c) => s + Number(c.monto_esperado ?? 0), 0);
  const mesNombre = hoy.toLocaleDateString("es-AR", { month: "long" });

  return (
    <div className="screen">
      <header className="appbar">
        <span />
        <div className="appbar-title">Administración</div>
        <form action={cerrarSesion} className="appbar-action">
          <button type="submit" className="appbar-btn" aria-label="Salir">⎋</button>
        </form>
      </header>

      <div className="screen-pad">
        {/* Panel de control */}
        <div className="stats">
          <div className="stat">
            <span className="stat-num ok">{alDia}<span style={{ color: "var(--ink-3)", fontSize: 16 }}>/{lista.length}</span></span>
            <span className="stat-lbl">Miembros al día</span>
          </div>
          <div className="stat">
            <span className="stat-num">${recaudado.toLocaleString("es-AR")}</span>
            <span className="stat-lbl">Recaudado en {mesNombre}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/alta" className="btn btn-primary btn-block">
            + Alta de miembro
          </Link>
          <Link href="/admin/novedades" className="btn btn-ghost btn-block">
            Novedades
          </Link>
        </div>

        <div className="section">
          <h2 className="section-title">Padrón de miembros</h2>
          <span className="section-count">{lista.length}</span>
        </div>

        <div className="padron">
          {lista.map((m) => {
            const estado = m.estado as EstadoMiembro;
            return (
              <Link key={m.id} href={`/admin/miembro/${m.id}`} className="padron-row">
                <span className="monogram padron-mono">
                  {iniciales(m.nombre, m.apellido)}
                </span>
                <div className="padron-body">
                  <div className="padron-name">{m.nombre} {m.apellido}</div>
                  <div className="padron-meta">
                    <span className="mono">#{m.numero_miembro}</span> · Doc {m.dni}
                  </div>
                </div>
                <span className={`pill ${PILL[estado] ?? "pill-idle"}`}>
                  <span className="pill-dot" />
                  {ETIQUETA_ESTADO[estado] ?? estado}
                </span>
              </Link>
            );
          })}
          {lista.length === 0 && <div className="empty">Todavía no hay miembros.</div>}
        </div>
      </div>
    </div>
  );
}
