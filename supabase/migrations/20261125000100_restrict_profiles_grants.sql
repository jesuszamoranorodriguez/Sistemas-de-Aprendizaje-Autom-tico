-- RLS no protege TRUNCATE: el rol authenticated no debe poder vaciar la tabla
-- ni tocar sus triggers o claves ajenas. Solo lectura y escritura de su fila.
revoke truncate, references, trigger on table public.profiles from authenticated, anon;
