-- Faltaban los privilegios de tabla: las políticas RLS estaban bien, pero el
-- rol authenticated no podía ni leer ni escribir public.profiles y PostgREST
-- devolvía «permission denied for table profiles».
grant select, insert, update on table public.profiles to authenticated;

-- El perfil es privado: los visitantes anónimos no tienen nada que hacer aquí.
revoke all on table public.profiles from anon;
