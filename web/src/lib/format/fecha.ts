const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Madrid",
});

export function formatearFecha(valor: string | Date): string {
  return formatoFecha.format(typeof valor === "string" ? new Date(valor) : valor);
}
