/**
 * /admin/alta — Alta de miembro (solo admin).
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { AltaForm } from "./alta-form";

export default async function AltaPage() {
  await requireUser(["admin"]);

  return (
    <div className="screen">
      <header className="appbar">
        <Link href="/admin" className="appbar-btn" aria-label="Volver">←</Link>
        <div className="appbar-title">Alta de miembro</div>
        <span />
      </header>
      <AltaForm />
    </div>
  );
}
