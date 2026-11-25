import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function destinoSeguro(valor: string | null): string {
  if (valor && valor.startsWith("/") && !valor.startsWith("//")) {
    return valor;
  }

  return "/panel";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const codigo = searchParams.get("code");
  const destino = destinoSeguro(searchParams.get("next"));

  if (!codigo) {
    return NextResponse.redirect(
      new URL("/entrar?error=enlace", request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(codigo);

  if (error) {
    return NextResponse.redirect(
      new URL("/entrar?error=enlace", request.url),
    );
  }

  return NextResponse.redirect(new URL(destino, request.url));
}
