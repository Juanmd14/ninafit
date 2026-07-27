/**
 * crear-miembro.mjs — Alta rápida de un/a miembro para pruebas (desarrollo).
 * (El alta "de verdad" será el ABM del admin; esto es solo para testear.)
 *
 * Uso:
 *   node --env-file=.env.local scripts/crear-miembro.mjs <documento> <clave4> [nombre] [apellido]
 * Ej:
 *   node --env-file=.env.local scripts/crear-miembro.mjs 38043103 3804 Juan García
 *
 * Usa `fetch` directo con la SERVICE_ROLE (createUser vía Admin API + PostgREST).
 * Nunca correr en producción.
 */
const [documento, clave, nombre = "Miembro", apellido = "Nuevo"] = process.argv.slice(2);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const lugarId = process.env.NEXT_PUBLIC_LUGAR_ANFITRION_ID;
const dominio = process.env.NEXT_PUBLIC_EMAIL_DOMINIO_MIEMBROS;

if (!url || !serviceKey || !anonKey || !lugarId || !dominio) {
  console.error("✗ Faltan variables de entorno (.env.local).");
  process.exit(1);
}
if (!/^\d{6,}$/.test(documento ?? "")) {
  console.error("✗ Documento inválido. Debe ser numérico (6+ dígitos).");
  process.exit(1);
}
if (!/^\d{4}$/.test(clave ?? "")) {
  console.error("✗ La clave debe ser de 4 dígitos.");
  process.exit(1);
}

// ⚠️ Debe coincidir con passwordDePin() en src/lib/auth/config.ts.
const passwordDePin = (pin) => `nfpin:${pin}`;

const svcHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function conReintento(path, init, tries = 5) {
  let ultimo;
  for (let i = 1; i <= tries; i++) {
    ultimo = await fetch(`${url}${path}`, init);
    if (ultimo.status !== 403) return ultimo; // 403 bad_jwt intermitente → reintentar
    await sleep(400 * i);
  }
  return ultimo;
}

async function asegurarUsuario(email, password) {
  const res = await conReintento("/auth/v1/admin/users", {
    method: "POST",
    headers: svcHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (res.ok) return (await res.json()).id;

  const body = await res.json().catch(() => ({}));
  if (!/exist|registered|already/i.test(JSON.stringify(body))) {
    throw new Error(`createUser ${email}: ${res.status} ${JSON.stringify(body)}`);
  }
  // Ya existía: id vía login (endpoint estable) y reseteo de clave.
  const login = await conReintento("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (login.ok) return (await login.json()).user.id;
  throw new Error(`${email} ya existe con otra clave. Reseteala desde el dashboard o borralo.`);
}

async function siguienteNumeroMiembro() {
  const res = await fetch(
    `${url}/rest/v1/miembros?lugar_id=eq.${lugarId}&select=numero_miembro`,
    { headers: svcHeaders },
  );
  const filas = res.ok ? await res.json() : [];
  const max = filas.reduce((m, f) => Math.max(m, parseInt(f.numero_miembro, 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
}

async function upsert(tabla, fila, onConflict) {
  const res = await fetch(`${url}/rest/v1/${tabla}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { ...svcHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(fila),
  });
  if (!res.ok) throw new Error(`upsert ${tabla}: ${res.status} ${await res.text()}`);
}

async function main() {
  const id = await asegurarUsuario(`${documento}@${dominio}`, passwordDePin(clave));
  await upsert("perfiles", { id, rol: "miembro", activo: true }, "id");
  const numero = await siguienteNumeroMiembro();
  await upsert(
    "miembros",
    {
      perfil_id: id,
      lugar_id: lugarId,
      nombre,
      apellido,
      dni: documento,
      numero_miembro: numero,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    },
    "dni",
  );
  console.log(`✓ Miembro creado → ${nombre} ${apellido} · documento ${documento} · clave ${clave} · N° ${numero}`);
  console.log("Probá en http://localhost:3000/login");
}

main().catch((e) => {
  console.error("✗ Error:", e.message ?? e);
  process.exit(1);
});
