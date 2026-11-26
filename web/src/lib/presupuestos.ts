import type { Database } from "@/types/database";

export type EstadoPresupuesto =
  Database["public"]["Enums"]["estado_presupuesto"];
export type TipoPartida = Database["public"]["Enums"]["tipo_partida"];
export type NivelConfianza = Database["public"]["Enums"]["nivel_confianza"];

export const ETIQUETAS_ESTADO: Record<EstadoPresupuesto, string> = {
  borrador: "Borrador",
  generando: "Generando",
  revisado: "Revisado",
  enviado: "Enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  caducado: "Caducado",
  facturado: "Facturado",
};

export const ETIQUETAS_TIPO: Record<TipoPartida, string> = {
  material: "Material",
  mano_obra: "Mano de obra",
  desplazamiento: "Desplazamiento",
  otro: "Otro",
};

export const TIPOS_PARTIDA = [
  "material",
  "mano_obra",
  "desplazamiento",
  "otro",
] as const;

export const FILTROS_ESTADO: { valor: "" | EstadoPresupuesto; etiqueta: string }[] =
  [
    { valor: "", etiqueta: "Todos" },
    { valor: "borrador", etiqueta: "Borradores" },
    { valor: "revisado", etiqueta: "Revisados" },
    { valor: "enviado", etiqueta: "Enviados" },
    { valor: "aceptado", etiqueta: "Aceptados" },
    { valor: "facturado", etiqueta: "Facturados" },
  ];

export function esEstadoFiltrable(
  valor: string | undefined,
): valor is EstadoPresupuesto {
  return (
    !!valor &&
    (Object.keys(ETIQUETAS_ESTADO) as EstadoPresupuesto[]).includes(
      valor as EstadoPresupuesto,
    )
  );
}

/**
 * Solo se pueden tocar las líneas de un presupuesto que todavía no ha salido
 * hacia el cliente. La base de datos bloquea además los aceptados y facturados.
 */
export function esEditable(estado: EstadoPresupuesto): boolean {
  return estado === "borrador" || estado === "revisado";
}

export function esCerrado(estado: EstadoPresupuesto): boolean {
  return (
    estado === "enviado" ||
    estado === "aceptado" ||
    estado === "rechazado" ||
    estado === "caducado" ||
    estado === "facturado"
  );
}
