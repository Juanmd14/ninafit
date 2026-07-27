/**
 * /admin/novedades — Publicar avisos y ver los ya publicados.
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { NovedadForm } from "./novedad-form";
import { eliminarNovedad } from "./actions";

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

export default async function AdminNovedadesPage() {
  await requireUser(["admin"]);
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
        <Link href="/admin" className="appbar-btn" aria-label="Volver">‹</Link>
        <div className="appbar-title">Novedades</div>
        <span />
      </header>

      <div className="screen-pad">
        <NovedadForm />

        <div className="section">
          <h2 className="section-title">Publicadas</h2>
          <span className="section-count">{lista.length}</span>
        </div>

        <div className="novedad-list">
          {lista.map((n) => (
            <div key={n.id} className="novedad">
              <span className="novedad-title">{n.titulo}</span>
              <span className="novedad-body">{n.cuerpo}</span>
              <span className="novedad-date">{fecha(n.publicada_at)}</span>
              <form action={eliminarNovedad.bind(null, n.id)}>
                <button type="submit" className="novedad-del">Eliminar</button>
              </form>
            </div>
          ))}
          {lista.length === 0 && <div className="empty">Todavía no publicaste avisos.</div>}
        </div>
      </div>
    </div>
  );
}
