function exigir(valor: string | undefined, nombre: string): string {
  if (!valor) {
    throw new Error(
      `Falta la variable ${nombre}. Añádela en web/.env.local y reinicia el servidor.`,
    );
  }

  return valor;
}

/**
 * Las variables se leen con referencias estáticas para que Next.js pueda
 * incrustar las NEXT_PUBLIC_* también en el bundle del navegador.
 */
export function entornoSupabase() {
  return {
    url: exigir(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    clavePublica: exigir(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}

export function urlDelSitio(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
