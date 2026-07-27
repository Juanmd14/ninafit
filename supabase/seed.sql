-- ============================================================================
-- Seed — datos base de ESTE deployment (Ninas Fit).
-- En el modelo "un proyecto Supabase por cliente", este archivo es lo que
-- cambia por cliente. La migración (esquema) es idéntica para todos.
--
-- El UUID del gimnasio es FIJO para que coincida con
-- NEXT_PUBLIC_LUGAR_ANFITRION_ID en .env.local.
-- ============================================================================

-- Gimnasio anfitrión (Ninas Fit) — hoy protagonista; mañana, un lugar más.
insert into public.lugares (id, tipo, nombre, slug, rubro, descripcion, direccion, activo)
values (
  '11111111-1111-1111-1111-111111111111',
  'gimnasio',
  'Ninas Fit',
  'ninas-fit',
  'HIIT',
  'Gimnasio de HIIT en Coronel Pringles, Buenos Aires.',
  'Coronel Pringles, Buenos Aires',
  true
)
on conflict (id) do nothing;

-- Comercio auspiciante de ejemplo (para probar QR y ofertas en desarrollo).
insert into public.lugares (tipo, nombre, slug, rubro, qr_token, activo)
values (
  'comercio',
  'Panadería La Espiga',
  'panaderia-la-espiga',
  'Gastronomía',
  'QR-ESPIGA-0001',
  true
)
on conflict (slug) do nothing;

-- El alta de admin y miembros necesita usuarios de Auth, así que NO va en el
-- seed SQL: se hace desde el panel del admin (service_role) o el dashboard.
-- Bootstrap del primer admin: crear el usuario en Auth y luego, con su UUID:
--   insert into public.perfiles (id, rol) values ('<uuid-del-admin>', 'admin');
