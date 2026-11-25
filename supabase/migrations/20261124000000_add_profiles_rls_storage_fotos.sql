-- Fase 1: datos y acceso.
-- Copia versionada de la migración aplicada con el MCP de Supabase
-- (add_profiles_rls_storage_fotos). El esquema de verdad vive en Supabase.

create type public.estado_presupuesto as enum (
  'borrador', 'generando', 'revisado', 'enviado', 'aceptado', 'rechazado', 'caducado', 'facturado'
);

create type public.tipo_partida as enum ('material', 'mano_obra', 'desplazamiento', 'otro');

create type public.nivel_confianza as enum ('alto', 'medio', 'bajo');

create type public.origen_partida as enum ('ia', 'manual');

create type public.estado_factura as enum ('emitida', 'pagada', 'anulada');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_comercial text,
  nombre_fiscal text,
  nif text,
  direccion text,
  cp text,
  ciudad text,
  provincia text,
  telefono text,
  email_contacto text,
  iban text,
  iva_defecto numeric(5, 2) not null default 21 check (iva_defecto >= 0 and iva_defecto <= 100),
  serie_factura_defecto text not null default 'F',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.profiles is 'Datos fiscales y de contacto del profesional. Una fila por cuenta de auth.users.';

alter table public.profiles enable row level security;

create policy "perfil_select_propio"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "perfil_insert_propio"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "perfil_update_propio"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email_contacto)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.marcar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger profiles_actualizado_en
  before update on public.profiles
  for each row execute function public.marcar_actualizado_en();

-- Bucket privado para las fotos de la avería. Solo JPEG, PNG y WebP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'presupuestos-fotos',
  'presupuestos-fotos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
);

create policy "fotos_select_propias"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'presupuestos-fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "fotos_insert_propias"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'presupuestos-fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "fotos_update_propias"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'presupuestos-fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'presupuestos-fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "fotos_delete_propias"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'presupuestos-fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
