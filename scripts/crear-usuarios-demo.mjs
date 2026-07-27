/**
 * crear-usuarios-demo.mjs — Usuarios de prueba SOLO para desarrollo.
 *
 * Crea (idempotente) un admin y un/a miembro para poder probar el login antes
 * de tener el ABM. La alta real de miembros la hace el admin desde la app.
 *
 * Uso (lee credenciales de .env.local):
 *   node --env-file=.env.local scripts/crear-usuarios-demo.mjs
 *
 * Nota: usa `fetch` directo (no @supabase/supabase-js, cuyo createUser no
 * tolera las claves sb_secret_*). El endpoint /auth/v1/admin/* puede devolver
 * `bad_jwt` de forma intermitente en proyectos nuevos → reintentamos, y para
 * resolver "usuario ya existe" usamos login (endpoint estable) en vez del
 * listado admin. OJO: usa la SERVICE_ROLE key. Nunca correr en producción.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const lugarId = process.env.NEXT_PUBLIC_LUGAR_ANFITRION_ID;
const dominio = process.env.NEXT_PUBLIC_EMAIL_DOMINIO_MIEMBROS;

if (!url || !serviceKey || !anonKey || !lugarId || !dominio) {
  console.error("✗ Faltan variables de entorno. Corré con: node --env-file=.env.local scripts/crear-usuarios-demo.mjs");
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

/** fetch con reintentos ante el `bad_jwt` intermitente (HTTP 403) de GoTrue. */
async function conReintento(path, init, tries = 5) {
  let ultimo;
  for (let i = 1; i <= tries; i++) {
    ultimo = await fetch(`${url}${path}`, init);
    if (ultimo.status !== 403) return ultimo;
    await sleep(400 * i);
  }
  return ultimo;
}

/**
 * Asegura un usuario de Auth con la password `password`. Si ya existe con una
 * password anterior (`previas`), lo detecta logueándolo y la migra. Devuelve id.
 */
async function asegurarUsuario(email, password, previas = []) {
  const res = await conReintento("/auth/v1/admin/users", {
    method: "POST",
    headers: svcHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (res.ok) return (await res.json()).id;

  const body = await res.json().catch(() => ({}));
  const yaExiste = /exist|registered|already/i.test(JSON.stringify(body));
  if (!yaExiste) {
    throw new Error(`createUser ${email}: ${res.status} ${JSON.stringify(body)}`);
  }

  // Ya existía: lo ubicamos logueándolo con la password nueva o alguna previa.
  for (const pw of [password, ...previas]) {
    const id = await idPorLogin(email, pw);
    if (!id) continue;
    if (pw !== password) await resetPassword(id, password); // migrar PIN
    return id;
  }
  throw new Error(`${email} ya existe pero no pude autenticarlo para obtener su id.`);
}

/** id de un usuario logueándolo (endpoint estable), o null si la pass no va. */
async function idPorLogin(email, password) {
  const res = await conReintento("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  return (await res.json()).user.id;
}

async function resetPassword(id, password) {
  const res = await conReintento(`/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers: svcHeaders,
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(`reset password ${id}: ${res.status} ${await res.text()}`);
}

/** Upsert en PostgREST resolviendo conflictos por `onConflict`. */
async function upsert(tabla, fila, onConflict) {
  const res = await fetch(`${url}/rest/v1/${tabla}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { ...svcHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(fila),
  });
  if (!res.ok) throw new Error(`upsert ${tabla}: ${res.status} ${await res.text()}`);
}

async function main() {
  // --- Admin (email + password) ---
  const adminId = await asegurarUsuario("admin@ninasfit.app", "Admin1234!");
  await upsert("perfiles", { id: adminId, rol: "admin", activo: true }, "id");
  console.log("✓ Admin listo → admin@ninasfit.app / Admin1234!");

  // --- Miembro (documento + clave de 4 dígitos, guardada como passwordDePin) ---
  const dni = "30111222";
  const pin = "1234";
  const miembroId = await asegurarUsuario(`${dni}@${dominio}`, passwordDePin(pin));
  await upsert("perfiles", { id: miembroId, rol: "miembro", activo: true }, "id");
  await upsert(
    "miembros",
    {
      perfil_id: miembroId,
      lugar_id: lugarId,
      nombre: "Sofía",
      apellido: "Gómez",
      dni,
      telefono: "2921000000",
      numero_miembro: "0001",
      intentos_fallidos: 0,
      bloqueado_hasta: null,
    },
    "dni",
  );
  console.log(`✓ Miembro listo → documento ${dni} / clave ${pin}`);

  console.log("\nProbá en http://localhost:3000/login");
}

main().catch((e) => {
  console.error("✗ Error:", e.message ?? e);
  process.exit(1);
});
