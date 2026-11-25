import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { entornoSupabase } from "./entorno";

export function createClient() {
  const { url, clavePublica } = entornoSupabase();

  return createBrowserClient<Database>(url, clavePublica);
}
