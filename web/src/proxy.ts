import { NextResponse, type NextRequest } from "next/server";

import { refrescarSesion } from "@/lib/supabase/proxy";

const RUTAS_PRIVADAS = ["/panel", "/onboarding"];

export async function proxy(request: NextRequest) {
  const { respuesta, user } = await refrescarSesion(request);
  const { pathname } = request.nextUrl;

  const esRutaPrivada = RUTAS_PRIVADAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );

  if (!user && esRutaPrivada) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    url.searchParams.set("siguiente", pathname);

    const redireccion = NextResponse.redirect(url);
    for (const cookie of respuesta.cookies.getAll()) {
      redireccion.cookies.set(cookie);
    }
    return redireccion;
  }

  if (user && pathname === "/entrar") {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    url.search = "";

    const redireccion = NextResponse.redirect(url);
    for (const cookie of respuesta.cookies.getAll()) {
      redireccion.cookies.set(cookie);
    }
    return redireccion;
  }

  return respuesta;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
