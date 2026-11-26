const formatoEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const formatoCantidad = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 3,
});

function aNumero(valor: number | string | null | undefined): number {
  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }

  const numero = typeof valor === "number" ? valor : Number(valor);

  return Number.isFinite(numero) ? numero : 0;
}

export function formatearEuros(valor: number | string | null | undefined): string {
  return formatoEuros.format(aNumero(valor));
}

export function formatearCantidad(
  valor: number | string | null | undefined,
): string {
  return formatoCantidad.format(aNumero(valor));
}
