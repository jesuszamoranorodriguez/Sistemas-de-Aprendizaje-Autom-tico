-- El rol service_role (clave secreta, solo servidor) también necesita permisos
-- de tabla: RLS no se le aplica, pero PostgREST sí comprueba los privilegios.
-- Sin esto, cualquier tarea administrativa sobre perfiles fallaría con
-- «permission denied for table profiles».
grant select, insert, update, delete on table public.profiles to service_role;
