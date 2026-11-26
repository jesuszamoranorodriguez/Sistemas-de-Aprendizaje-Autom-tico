"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { guardarPartida, type EstadoPartida } from "@/actions/partidas";
import { Aviso } from "@/components/ui/Aviso";
import { Boton, clasesBoton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoSelect } from "@/components/ui/CampoSelect";
import { formatearEuros } from "@/lib/format/moneda";
import {
  ETIQUETAS_TIPO,
  TIPOS_PARTIDA,
  type TipoPartida,
} from "@/lib/presupuestos";

const ESTADO_INICIAL: EstadoPartida = {};

export type PartidaEditable = {
  id: string;
  tipo: TipoPartida;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
};

type Props = {
  presupuestoId: string;
  partida?: PartidaEditable;
  hrefCancelar: string;
};

export function FormularioPartida({
  presupuestoId,
  partida,
  hrefCancelar,
}: Props) {
  const [estado, accion, pendiente] = useActionState(
    guardarPartida,
    ESTADO_INICIAL,
  );
  const valores = estado.valores ?? {};
  const errores = estado.campos ?? {};

  const valor = (clave: keyof PartidaEditable, porDefecto = "") => {
    if (clave in valores) {
      return valores[clave] ?? "";
    }

    const original = partida?.[clave];

    return original === null || original === undefined
      ? porDefecto
      : String(original);
  };

  const [cantidad, setCantidad] = useState(valor("cantidad", "1"));
  const [precio, setPrecio] = useState(valor("precio_unitario", ""));

  const cantidadNumero = Number(cantidad.replace(",", "."));
  const precioNumero = Number(precio.replace(",", "."));
  const importe =
    Number.isFinite(cantidadNumero) && Number.isFinite(precioNumero)
      ? cantidadNumero * precioNumero
      : 0;

  return (
    <form action={accion} noValidate>
      <input type="hidden" name="presupuesto_id" value={presupuestoId} />
      {partida ? <input type="hidden" name="id" value={partida.id} /> : null}

      {estado.error ? (
        <Aviso tono="error" className="mb-5">
          {estado.error}
        </Aviso>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoSelect
          id="partida-tipo"
          name="tipo"
          etiqueta="Tipo"
          defaultValue={valor("tipo", "material")}
          error={errores.tipo}
        >
          {TIPOS_PARTIDA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {ETIQUETAS_TIPO[tipo]}
            </option>
          ))}
        </CampoSelect>

        <Campo
          id="partida-unidad"
          name="unidad"
          etiqueta="Unidad"
          ayuda="ud, h, m², kg…"
          defaultValue={valor("unidad", "ud")}
          maxLength={12}
          error={errores.unidad}
          required
        />

        <div className="sm:col-span-2">
          <Campo
            id="partida-descripcion"
            name="descripcion"
            etiqueta="Descripción"
            ayuda="Lo que verá el cliente en el presupuesto."
            defaultValue={valor("descripcion")}
            maxLength={300}
            error={errores.descripcion}
            required
          />
        </div>

        <Campo
          id="partida-cantidad"
          name="cantidad"
          type="number"
          etiqueta="Cantidad"
          value={cantidad}
          onChange={(evento) => setCantidad(evento.target.value)}
          inputMode="decimal"
          step="0.001"
          min="0.001"
          error={errores.cantidad}
          required
        />

        <Campo
          id="partida-precio"
          name="precio_unitario"
          type="number"
          etiqueta="Precio unitario (€)"
          value={precio}
          onChange={(evento) => setPrecio(evento.target.value)}
          inputMode="decimal"
          step="0.01"
          min="0"
          error={errores.precio_unitario}
          required
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-tinta/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-tinta/65">
          Importe:{" "}
          <span className="font-semibold text-tinta tabular-nums">
            {formatearEuros(importe)}
          </span>
        </p>

        <div className="flex items-center gap-4">
          <Link href={hrefCancelar} className={clasesBoton("sutil")}>
            Cancelar
          </Link>
          <Boton type="submit" disabled={pendiente}>
            {pendiente
              ? "Guardando…"
              : partida
                ? "Guardar cambios"
                : "Añadir partida"}
          </Boton>
        </div>
      </div>
    </form>
  );
}
