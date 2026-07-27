-- ============================================================================
-- Ninas Fit — Esquema inicial
-- ============================================================================
-- Principios:
--  * `lugares` unifica al gimnasio y a los comercios auspiciantes. Ninas Fit
--    es una fila más (tipo='gimnasio'); nunca está hardcodeado como "el centro".
--  * El ESTADO de un/a miembro (al_dia/suspendida/en_pausa) NO se guarda: se
--    DERIVA de las cuotas + la fecha (función estado_miembro). Cero desincro.
--  * `cuotas` guarda solo HECHOS ('pendiente'|'pagada'|'en_pausa'|'anulada').
--    'suspendida' es puro cálculo (pendiente + pasó el día 10).
--  * RLS por rol vía perfiles (mi_rol / mi_lugar_id / mi_miembro_id).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------------

-- Lugares: gimnasio + comercios auspiciantes (tabla unificada)
create table public.lugares (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('gimnasio', 'comercio')),
  nombre        text not null,
  slug          text not null unique,
  rubro         text,
  descripcion   text,
  logo_url      text,
  direccion     text,
  telefono      text,
  email_contacto text,
  qr_token      text unique,                 -- lo que se imprime y escanea (comercios)
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table public.lugares is 'Gimnasio y comercios auspiciantes. Ninas Fit es una fila (tipo=gimnasio).';

-- Perfiles: 1:1 con auth.users. Ancla de RLS.
create table public.perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('admin', 'miembro', 'comercio')),
  lugar_id   uuid references public.lugares(id) on delete set null, -- solo comercio
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);
comment on column public.perfiles.lugar_id is 'Para rol=comercio: qué lugar gestiona. null en admin/miembro.';

-- Miembros: la clientela del gimnasio (target del ABM del admin)
create table public.miembros (
  id                uuid primary key default gen_random_uuid(),
  perfil_id         uuid not null references public.perfiles(id) on delete cascade,
  lugar_id          uuid not null references public.lugares(id) on delete restrict,
  nombre            text not null,
  apellido          text not null,
  dni               text not null unique,
  telefono          text,
  numero_miembro    text not null,           -- "número de eslabón"
  intentos_fallidos int not null default 0,  -- rate-limit login clave
  bloqueado_hasta   timestamptz,             -- rate-limit login clave
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (lugar_id, numero_miembro)
);

-- Cuotas: obligación mensual + pago. Lista para webhook de MP sin migración.
create table public.cuotas (
  id                 uuid primary key default gen_random_uuid(),
  miembro_id         uuid not null references public.miembros(id) on delete cascade,
  periodo            date not null,          -- primer día del mes
  monto_esperado     numeric(12,2) not null default 0,
  estado             text not null default 'pendiente'
                       check (estado in ('pendiente', 'pagada', 'en_pausa', 'anulada')),
  metodo             text check (metodo in ('cuenta_dni','santander','mercado_pago','efectivo','otro')),
  fecha_pago         timestamptz,
  marcado_por        uuid references public.perfiles(id) on delete set null,
  referencia_externa text,                   -- futuro: payment/preference id de MP
  proveedor_payload  jsonb,                  -- futuro: raw del webhook
  created_at         timestamptz not null default now(),
  unique (miembro_id, periodo)
);
comment on column public.cuotas.estado is 'Solo hechos. "suspendida" NO se guarda: se deriva (ver estado_miembro).';

-- Novedades: avisos del gimnasio
create table public.novedades (
  id           uuid primary key default gen_random_uuid(),
  lugar_id     uuid not null references public.lugares(id) on delete cascade,
  titulo       text not null,
  cuerpo       text not null,
  publicada    boolean not null default true,
  publicada_at timestamptz not null default now(),
  created_by   uuid references public.perfiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Ofertas: promos de los comercios auspiciantes
create table public.ofertas (
  id                 uuid primary key default gen_random_uuid(),
  lugar_id           uuid not null references public.lugares(id) on delete cascade,
  titulo             text not null,
  descripcion        text,
  imagen_url         text,
  solo_fin_de_semana boolean not null default false,   -- vie/sáb/dom
  vigencia_desde     date,
  vigencia_hasta     date,
  activa             boolean not null default true,
  created_at         timestamptz not null default now()
);

-- Escaneos: visitas por QR (el argumento comercial de la dueña)
create table public.escaneos (
  id                 uuid primary key default gen_random_uuid(),
  miembro_id         uuid not null references public.miembros(id) on delete cascade,
  lugar_id           uuid not null references public.lugares(id) on delete cascade,
  oferta_id          uuid references public.ofertas(id) on delete set null,
  estado_al_escanear text not null check (estado_al_escanear in ('al_dia','suspendida','en_pausa')),
  habilitado         boolean not null,       -- ¿se otorgó el beneficio?
  created_at         timestamptz not null default now()
);

-- Índices
create index idx_lugares_tipo on public.lugares (tipo);
create index idx_miembros_perfil on public.miembros (perfil_id);
create index idx_miembros_lugar on public.miembros (lugar_id);
create index idx_cuotas_miembro on public.cuotas (miembro_id);
create index idx_novedades_lugar on public.novedades (lugar_id, publicada, publicada_at desc);
create index idx_ofertas_lugar on public.ofertas (lugar_id, activa);
create index idx_escaneos_lugar_fecha on public.escaneos (lugar_id, created_at desc);
create index idx_escaneos_miembro on public.escaneos (miembro_id);

-- ---------------------------------------------------------------------------
-- 2. updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_lugares_updated before update on public.lugares
  for each row execute function public.set_updated_at();
create trigger trg_miembros_updated before update on public.miembros
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. HELPERS de rol (SECURITY DEFINER: leen perfiles sin recursión de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.mi_rol()
returns text language sql stable security definer set search_path = '' as $$
  select rol from public.perfiles where id = (select auth.uid());
$$;

create or replace function public.mi_lugar_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select lugar_id from public.perfiles where id = (select auth.uid());
$$;

create or replace function public.mi_miembro_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.miembros where perfil_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 4. ESTADO DERIVADO (resuelve desincronización y respaldo si el cron no corre)
-- ---------------------------------------------------------------------------
create or replace function public.periodo_actual(p_fecha date default current_date)
returns date language sql immutable set search_path = '' as $$
  select date_trunc('month', p_fecha)::date;
$$;

-- Estado VIGENTE de un/a miembro, calculado en vivo. SECURITY INVOKER: respeta
-- la RLS de quien pregunta (admin ve todos; miembro solo el suyo).
create or replace function public.estado_miembro(p_miembro_id uuid, p_fecha date default current_date)
returns text language plpgsql stable security invoker set search_path = '' as $$
declare
  v_estado_cuota text;
  v_dia int := extract(day from p_fecha);   -- regla de negocio: día límite = 10
begin
  select c.estado into v_estado_cuota
  from public.cuotas c
  where c.miembro_id = p_miembro_id
    and c.periodo = public.periodo_actual(p_fecha);

  if v_estado_cuota is null then
    -- No hay fila del período (el cron no la generó): respaldo por fecha.
    return case when v_dia <= 10 then 'al_dia' else 'suspendida' end;
  end if;

  return case v_estado_cuota
    when 'pagada'    then 'al_dia'
    when 'en_pausa'  then 'en_pausa'
    when 'anulada'   then 'al_dia'                                        -- exenta ese mes
    when 'pendiente' then case when v_dia <= 10 then 'al_dia' else 'suspendida' end
    else 'suspendida'
  end;
end;
$$;

-- Vista para el padrón del admin y el login: cada miembro con su estado derivado.
create view public.vista_miembros_estado with (security_invoker = on) as
  select m.*, public.estado_miembro(m.id, current_date) as estado
  from public.miembros m;

-- ---------------------------------------------------------------------------
-- 5. RPC: registrar_escaneo (chequeo de cuota server-side, no falsificable)
-- ---------------------------------------------------------------------------
create or replace function public.registrar_escaneo(p_qr_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_miembro public.miembros%rowtype;
  v_lugar   public.lugares%rowtype;
  v_oferta  public.ofertas%rowtype;
  v_estado text;
  v_habilitado boolean;
begin
  select m.* into v_miembro from public.miembros m where m.perfil_id = (select auth.uid());
  if v_miembro.id is null then
    raise exception 'No sos un/a miembro registrado' using errcode = '42501';
  end if;

  select l.* into v_lugar
  from public.lugares l
  where l.qr_token = p_qr_token and l.tipo = 'comercio' and l.activo = true;
  if v_lugar.id is null then
    raise exception 'QR inválido o comercio inactivo' using errcode = 'P0002';
  end if;

  v_estado := public.estado_miembro(v_miembro.id, current_date);
  v_habilitado := (v_estado = 'al_dia');

  -- Oferta vigente del comercio (respeta fin de semana si aplica)
  select o.* into v_oferta
  from public.ofertas o
  where o.lugar_id = v_lugar.id
    and o.activa = true
    and (o.vigencia_desde is null or o.vigencia_desde <= current_date)
    and (o.vigencia_hasta is null or o.vigencia_hasta >= current_date)
    and (o.solo_fin_de_semana = false or extract(isodow from current_date) in (5, 6, 7))
  order by o.created_at desc
  limit 1;

  -- Registrar la visita SIEMPRE (stats honestas), con snapshot del estado.
  insert into public.escaneos (miembro_id, lugar_id, oferta_id, estado_al_escanear, habilitado)
  values (v_miembro.id, v_lugar.id,
          case when v_habilitado then v_oferta.id else null end,
          v_estado, v_habilitado);

  return jsonb_build_object(
    'habilitado', v_habilitado,
    'estado', v_estado,
    'comercio', jsonb_build_object('id', v_lugar.id, 'nombre', v_lugar.nombre, 'rubro', v_lugar.rubro),
    'oferta', case when v_habilitado and v_oferta.id is not null
                   then jsonb_build_object('titulo', v_oferta.titulo, 'descripcion', v_oferta.descripcion)
                   else null end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.lugares   enable row level security;
alter table public.perfiles  enable row level security;
alter table public.miembros  enable row level security;
alter table public.cuotas    enable row level security;
alter table public.novedades enable row level security;
alter table public.ofertas   enable row level security;
alter table public.escaneos  enable row level security;

-- perfiles: cada uno ve el suyo; admin ve todos. Escritura: admin (o service_role).
create policy perfiles_select on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or public.mi_rol() = 'admin');
create policy perfiles_admin on public.perfiles for all to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- lugares: todos ven los activos; comercio ve el propio; admin todo.
create policy lugares_select on public.lugares for select to authenticated
  using (activo or public.mi_rol() = 'admin' or id = public.mi_lugar_id());
create policy lugares_admin on public.lugares for all to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');
create policy lugares_comercio_update on public.lugares for update to authenticated
  using (id = public.mi_lugar_id()) with check (id = public.mi_lugar_id());

-- miembros: cada quien ve el suyo; admin todo. Escritura: admin (o service_role).
create policy miembros_select on public.miembros for select to authenticated
  using (perfil_id = (select auth.uid()) or public.mi_rol() = 'admin');
create policy miembros_admin on public.miembros for all to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- cuotas: cada quien ve las suyas; admin todo.
create policy cuotas_select on public.cuotas for select to authenticated
  using (miembro_id = public.mi_miembro_id() or public.mi_rol() = 'admin');
create policy cuotas_admin on public.cuotas for all to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- novedades: todos ven las publicadas; admin gestiona.
create policy novedades_select on public.novedades for select to authenticated
  using (publicada or public.mi_rol() = 'admin' or lugar_id = public.mi_lugar_id());
create policy novedades_admin on public.novedades for all to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- ofertas: todos ven las activas; el comercio gestiona las propias; admin todo.
create policy ofertas_select on public.ofertas for select to authenticated
  using (activa or public.mi_rol() = 'admin' or lugar_id = public.mi_lugar_id());
create policy ofertas_admin on public.ofertas for all to authenticated
  using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');
create policy ofertas_comercio on public.ofertas for all to authenticated
  using (lugar_id = public.mi_lugar_id() and public.mi_rol() = 'comercio')
  with check (lugar_id = public.mi_lugar_id() and public.mi_rol() = 'comercio');

-- escaneos: admin todo; comercio ve los suyos; miembro ve los propios.
-- INSERT solo vía registrar_escaneo (SECURITY DEFINER): no hay policy de insert.
create policy escaneos_select on public.escaneos for select to authenticated
  using (
    public.mi_rol() = 'admin'
    or lugar_id = public.mi_lugar_id()
    or miembro_id = public.mi_miembro_id()
  );

-- ---------------------------------------------------------------------------
-- 7. GRANTS (RLS es la compuerta; sin policy = sin acceso)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.vista_miembros_estado to authenticated;
grant execute on function public.registrar_escaneo(text) to authenticated;
grant execute on function public.estado_miembro(uuid, date) to authenticated;
grant execute on function public.periodo_actual(date) to authenticated;
grant all on all tables in schema public to service_role;
