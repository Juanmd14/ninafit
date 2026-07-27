/**
 * /inicio/novedades — Avisos del gimnasio para el/la miembro (solo lectura).
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

export default async function NovedadesPage() {
  await requireUser(["miembro"]);
  const supabase = await createClient();

  const { data: novedades } = await supabase
    .from("novedades")
    .select("id, titulo, cuerpo, publicada_at")
    .eq("publicada", true)
    .order("publicada_at", { ascending: false });

  const lista = novedades ?? [];

  return (
    <div className="screen">
      <header className="appbar">
        <Link href="/inicio" className="appbar-btn" aria-label="Volver">‹</Link>
        <div className="appbar-title">Novedades</div>
        <span />
      </header>

      <div className="screen-pad">
        <div className="novedad-list">
          {lista.map((n) => (
            <div key={n.id} className="novedad">
              <span className="novedad-title">{n.titulo}</span>
              <span className="novedad-body">{n.cuerpo}</span>
              <span className="novedad-date">{fecha(n.publicada_at)}</span>
            </div>
          ))}
          {lista.length === 0 && <div className="empty">No hay novedades por ahora.</div>}
        </div>
      </div>
    </div>
  );
}
