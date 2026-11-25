import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Cliente con la clave secreta. Solo para tareas administrativas puntuales
 * desde el servidor (por ejemplo, limpiar un bucket). Salta RLS: trátalo
 * como una herramienta peligrosa y no lo importes nunca desde el cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveSecreta = process.env.SUPABASE_SECRET_KEY;

  if (!url || !claveSecreta) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en web/.env.local.",
    );
  }

  return createSupabaseClient<Database>(url, claveSecreta, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
