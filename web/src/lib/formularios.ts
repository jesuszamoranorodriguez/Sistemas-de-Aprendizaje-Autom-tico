/** Helpers para leer formularios sin perder lo que ya había escrito la persona. */

export function texto(formData: FormData, clave: string): string {
  const valor = formData.get(clave);
  return typeof valor === "string" ? valor : "";
}

/** Acepta tanto «12,5» como «12.5» en los campos numéricos. */
export function numero(formData: FormData, clave: string): string {
  return texto(formData, clave).replace(",", ".").trim();
}

export function valoresDe(
  formData: FormData,
  campos: readonly string[],
): Record<string, string> {
  return Object.fromEntries(campos.map((campo) => [campo, texto(formData, campo)]));
}

export function esUuid(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    valor,
  );
}

export function erroresDe(
  problemas: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const campos: Record<string, string> = {};

  for (const problema of problemas) {
    const campo = String(problema.path[0] ?? "general");
    campos[campo] ??= problema.message;
  }

  return campos;
}
