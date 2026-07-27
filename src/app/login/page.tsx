/**
 * /login — Pantalla de ingreso.
 * Si ya hay sesión, no tiene sentido mostrar el login: redirige al destino
 * del rol. Si no, muestra la marca + el formulario.
 */
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth/session";
import { getRutaPostLogin } from "@/lib/config/experiencia";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const usuario = await getUsuarioActual();
  if (usuario) redirect(getRutaPostLogin(usuario.rol));

  return (
    <div className="screen">
      <div className="screen-pad" style={{ justifyContent: "center", gap: 22 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NiNa'S HIIT" width={72} height={72} style={{ objectFit: "contain" }} />
          <h1 style={{ fontFamily: "var(--fh)", fontSize: 28, margin: 0 }}>
            NiNa&apos;S <em style={{ color: "var(--accent)" }}>HIIT</em>
          </h1>
          <p className="screen-note" style={{ margin: 0 }}>
            Ingresá a tu espacio del gimnasio.
          </p>
        </div>

        <LoginForm />

        <p className="screen-note" style={{ margin: 0 }}>
          Entrá con tu <b>DNI</b> y el <b>PIN</b> que te dio el gimnasio.
        </p>
      </div>
    </div>
  );
}
