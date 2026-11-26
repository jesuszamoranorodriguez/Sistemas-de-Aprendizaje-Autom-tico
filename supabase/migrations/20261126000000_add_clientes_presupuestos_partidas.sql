-- Fase 2: presupuestos manuales.
-- Copia versionada de la migración aplicada con el MCP de Supabase
-- (add_clientes_presupuestos_partidas). El esquema de verdad vive en Supabase.

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references public.profiles (id) on delete cascade,
  nombre text not null check (length(trim(nombre)) > 0),
  nif text,
  email text,
  telefono text,
  direccion text,
  cp text,
  ciudad text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.clientes is 'Clientes del profesional. Cada fila pertenece a una cuenta de profiles.';

create index clientes_propietario_nombre_idx
  on public.clientes (propietario_id, nombre);

create unique index clientes_propietario_nif_idx
  on public.clientes (propietario_id, nif)
  where nif is not null;

create table public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references public.profiles (id) on delete cascade,
  cliente_id uuid references public.clientes (id) on delete set null,
  titulo text not null check (length(trim(titulo)) > 0),
  descripcion_averia text,
  estado public.estado_presupuesto not null default 'borrador',
  token_publico uuid not null unique default gen_random_uuid(),
  validez_dias integer not null default 15 check (validez_dias between 1 and 365),
  iva_porcentaje numeric(5, 2) not null default 21 check (iva_porcentaje in (21, 10)),
  base_imponible numeric(12, 2) not null default 0 check (base_imponible >= 0),
  cuota_iva numeric(12, 2) not null default 0 check (cuota_iva >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  requiere_visita boolean not null default false,
  notas text,
  ia_modelo text,
  ia_generado_en timestamptz,
  validado_en timestamptz,
  enviado_en timestamptz,
  respondido_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.presupuestos is 'Presupuestos del profesional. Los totales los mantienen los triggers de partidas.';

create index presupuestos_propietario_creado_idx
  on public.presupuestos (propietario_id, creado_en desc);

create index presupuestos_propietario_estado_idx
  on public.presupuestos (propietario_id, estado);

create index presupuestos_cliente_idx
  on public.presupuestos (cliente_id);

create table public.partidas (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.presupuestos (id) on delete cascade,
  orden integer not null default 0,
  tipo public.tipo_partida not null default 'material',
  descripcion text not null check (length(trim(descripcion)) > 0),
  cantidad numeric(12, 3) not null default 1 check (cantidad > 0),
  unidad text not null default 'ud' check (length(trim(unidad)) > 0),
  precio_unitario numeric(12, 2) not null default 0 check (precio_unitario >= 0),
  importe numeric(12, 2) generated always as (round(cantidad * precio_unitario, 2)) stored,
  confianza public.nivel_confianza,
  origen public.origen_partida not null default 'manual',
  precio_confirmado boolean not null default false,
  creado_en timestamptz not null default now()
);

comment on table public.partidas is 'Líneas del presupuesto. El importe es una columna generada.';

create index partidas_presupuesto_orden_idx
  on public.partidas (presupuesto_id, orden, creado_en);

create trigger clientes_actualizado_en
  before update on public.clientes
  for each row execute function public.marcar_actualizado_en();

create trigger presupuestos_actualizado_en
  before update on public.presupuestos
  for each row execute function public.marcar_actualizado_en();

-- El cliente de un presupuesto tiene que ser de la misma cuenta.
create or replace function public.validar_cliente_del_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.cliente_id is not null and not exists (
    select 1
    from public.clientes c
    where c.id = new.cliente_id
      and c.propietario_id = new.propietario_id
  ) then
    raise exception 'El cliente no pertenece a esta cuenta.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

revoke all on function public.validar_cliente_del_presupuesto() from public, anon, authenticated;

create trigger presupuestos_validar_cliente
  before insert or update of cliente_id, propietario_id on public.presupuestos
  for each row execute function public.validar_cliente_del_presupuesto();

-- Totales: base, cuota y total se derivan siempre de las partidas.
create or replace function public.recalcular_totales(p_presupuesto_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  with totales as (
    select
      coalesce(sum(importe), 0) as base,
      coalesce(bool_or(confianza = 'bajo'), false) as requiere_visita
    from public.partidas
    where presupuesto_id = p_presupuesto_id
  )
  update public.presupuestos p
  set
    base_imponible = t.base,
    cuota_iva = round(t.base * p.iva_porcentaje / 100, 2),
    total = t.base + round(t.base * p.iva_porcentaje / 100, 2),
    requiere_visita = t.requiere_visita
  from totales t
  where p.id = p_presupuesto_id;
$$;

revoke all on function public.recalcular_totales(uuid) from public, anon, authenticated;

create or replace function public.trg_partidas_recalcular()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_viejo uuid;
  v_nuevo uuid;
begin
  if tg_op in ('UPDATE', 'DELETE') then
    v_viejo := old.presupuesto_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    v_nuevo := new.presupuesto_id;
  end if;

  if v_viejo is not null then
    perform public.recalcular_totales(v_viejo);
  end if;

  if v_nuevo is not null and v_nuevo is distinct from v_viejo then
    perform public.recalcular_totales(v_nuevo);
  end if;

  return null;
end;
$$;

revoke all on function public.trg_partidas_recalcular() from public, anon, authenticated;

create trigger partidas_recalcular
  after insert or update or delete on public.partidas
  for each row execute function public.trg_partidas_recalcular();

-- Al cambiar el IVA, se recalculan cuota y total sin tocar las líneas.
create or replace function public.trg_presupuestos_iva()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalcular_totales(new.id);
  return null;
end;
$$;

revoke all on function public.trg_presupuestos_iva() from public, anon, authenticated;

create trigger presupuestos_recalcular_iva
  after update of iva_porcentaje on public.presupuestos
  for each row execute function public.trg_presupuestos_iva();

-- Un presupuesto aceptado o facturado ya no admite cambios en sus líneas.
create or replace function public.proteger_presupuesto_aceptado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado public.estado_presupuesto;
  v_presupuesto_id uuid;
begin
  v_presupuesto_id := coalesce(new.presupuesto_id, old.presupuesto_id);

  select estado
  into v_estado
  from public.presupuestos
  where id = v_presupuesto_id;

  if v_estado in ('aceptado', 'facturado') then
    raise exception 'El presupuesto ya está aceptado o facturado: sus partidas no se pueden cambiar.'
      using errcode = 'check_violation';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.proteger_presupuesto_aceptado() from public, anon, authenticated;

create trigger partidas_proteger
  before insert or update or delete on public.partidas
  for each row execute function public.proteger_presupuesto_aceptado();

-- Protege los campos que afectan a un presupuesto cerrado y su borrado.
create or replace function public.trg_presupuestos_proteger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.estado in ('aceptado', 'facturado') then
      raise exception 'Un presupuesto aceptado o facturado no se puede borrar.'
        using errcode = 'check_violation';
    end if;

    return old;
  end if;

  if old.estado in ('aceptado', 'facturado') and (
    new.iva_porcentaje is distinct from old.iva_porcentaje
    or new.cliente_id is distinct from old.cliente_id
    or new.token_publico is distinct from old.token_publico
  ) then
    raise exception 'Un presupuesto aceptado o facturado no se puede modificar.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

revoke all on function public.trg_presupuestos_proteger() from public, anon, authenticated;

create trigger presupuestos_proteger
  before update or delete on public.presupuestos
  for each row execute function public.trg_presupuestos_proteger();

-- RLS
alter table public.clientes enable row level security;
alter table public.presupuestos enable row level security;
alter table public.partidas enable row level security;

create policy "clientes_select_propios"
  on public.clientes for select
  to authenticated
  using (propietario_id = (select auth.uid()));

create policy "clientes_insert_propios"
  on public.clientes for insert
  to authenticated
  with check (propietario_id = (select auth.uid()));

create policy "clientes_update_propios"
  on public.clientes for update
  to authenticated
  using (propietario_id = (select auth.uid()))
  with check (propietario_id = (select auth.uid()));

create policy "clientes_delete_propios"
  on public.clientes for delete
  to authenticated
  using (propietario_id = (select auth.uid()));

create policy "presupuestos_select_propios"
  on public.presupuestos for select
  to authenticated
  using (propietario_id = (select auth.uid()));

create policy "presupuestos_insert_propios"
  on public.presupuestos for insert
  to authenticated
  with check (propietario_id = (select auth.uid()));

create policy "presupuestos_update_propios"
  on public.presupuestos for update
  to authenticated
  using (propietario_id = (select auth.uid()))
  with check (propietario_id = (select auth.uid()));

create policy "presupuestos_delete_propios"
  on public.presupuestos for delete
  to authenticated
  using (propietario_id = (select auth.uid()));

create policy "partidas_select_propias"
  on public.partidas for select
  to authenticated
  using (
    exists (
      select 1 from public.presupuestos p
      where p.id = partidas.presupuesto_id
        and p.propietario_id = (select auth.uid())
    )
  );

create policy "partidas_insert_propias"
  on public.partidas for insert
  to authenticated
  with check (
    exists (
      select 1 from public.presupuestos p
      where p.id = partidas.presupuesto_id
        and p.propietario_id = (select auth.uid())
    )
  );

create policy "partidas_update_propias"
  on public.partidas for update
  to authenticated
  using (
    exists (
      select 1 from public.presupuestos p
      where p.id = partidas.presupuesto_id
        and p.propietario_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.presupuestos p
      where p.id = partidas.presupuesto_id
        and p.propietario_id = (select auth.uid())
    )
  );

create policy "partidas_delete_propias"
  on public.partidas for delete
  to authenticated
  using (
    exists (
      select 1 from public.presupuestos p
      where p.id = partidas.presupuesto_id
        and p.propietario_id = (select auth.uid())
    )
  );

-- Privilegios de tabla (RLS no basta).
grant select, insert, update, delete on table public.clientes, public.presupuestos, public.partidas to authenticated;
grant select, insert, update, delete on table public.clientes, public.presupuestos, public.partidas to service_role;

revoke all on table public.clientes, public.presupuestos, public.partidas from anon;
revoke truncate, references, trigger on table public.clientes, public.presupuestos, public.partidas from authenticated, anon;
