/**
 * /comercio — Landing del comercio auspiciante (placeholder del módulo de auth).
 * Se reemplaza por promos + verificación de miembros (QR) en módulos siguientes.
 */
import { requireUser } from "@/lib/auth/session";
import { cerrarSesion } from "@/app/login/actions";

export default async function ComercioPage() {
  const usuario = await requireUser(["comercio"]);

  return (
    <div className="screen">
      <div className="screen-pad" style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 14 }}>
        <span className="brand-mark" style={{ width: 48, height: 48, fontSize: 26, borderRadius: 14 }}>N</span>
        <h1 style={{ fontFamily: "var(--fh)", fontSize: 26, margin: 0 }}>Panel del comercio</h1>
        <p className="screen-note" style={{ margin: 0 }}>
          Sesión iniciada como <b>{usuario.email}</b>. Acá van a ir tus promos y la verificación de miembros.
        </p>
        <form action={cerrarSesion}>
          <button type="submit" className="btn btn-ghost">Cerrar sesión</button>
        </form>
      </div>
    </div>
  );
}
