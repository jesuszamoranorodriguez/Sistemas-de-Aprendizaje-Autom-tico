import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

import { entornoSupabase } from "./entorno";

/**
 * Refresca la sesión de Supabase y devuelve la respuesta con las cookies
 * actualizadas. Se llama desde `web/proxy.ts` en cada petición.
 */
export async function refrescarSesion(request: NextRequest) {
  const { url, clavePublica } = entornoSupabase();

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, clavePublica, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaEscribir, cabeceras) {
        for (const { name, value } of cookiesParaEscribir) {
          request.cookies.set(name, value);
        }

        respuesta = NextResponse.next({ request });

        for (const { name, value, options } of cookiesParaEscribir) {
          respuesta.cookies.set(name, value, options);
        }

        if (cabeceras) {
          for (const [clave, valor] of Object.entries(cabeceras)) {
            respuesta.headers.set(clave, valor);
          }
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { respuesta, user };
}
