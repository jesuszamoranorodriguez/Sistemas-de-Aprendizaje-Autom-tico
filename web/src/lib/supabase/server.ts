import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { entornoSupabase } from "./entorno";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, clavePublica } = entornoSupabase();

  return createServerClient<Database>(url, clavePublica, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaEscribir) {
        try {
          for (const { name, value, options } of cookiesParaEscribir) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Desde un componente de servidor no se pueden escribir cookies.
          // El proxy se encarga de refrescar la sesión en la siguiente petición.
        }
      },
    },
  });
}
