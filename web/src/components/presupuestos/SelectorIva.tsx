"use client";

import { useActionState, useEffect, useState } from "react";

import { cambiarIva, type EstadoIva } from "@/actions/presupuestos";
import { Boton } from "@/components/ui/Boton";
import { CampoSelect } from "@/components/ui/CampoSelect";

const ESTADO_INICIAL: EstadoIva = {};

type Props = {
  presupuestoId: string;
  ivaActual: number;
};

export function SelectorIva({ presupuestoId, ivaActual }: Props) {
  const [estado, accion, pendiente] = useActionState(cambiarIva, ESTADO_INICIAL);
  const [iva, setIva] = useState(String(ivaActual));

  useEffect(() => {
    setIva(String(ivaActual));
  }, [ivaActual]);

  return (
    <form action={accion} className="mt-4 border-t border-tinta/10 pt-4">
      <input type="hidden" name="presupuesto_id" value={presupuestoId} />

      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <CampoSelect
            id="iva-presupuesto"
            name="iva_porcentaje"
            etiqueta="IVA"
            value={iva}
            onChange={(evento) => setIva(evento.target.value)}
          >
            <option value="21">21 % — tipo general</option>
            <option value="10">10 % — obras en vivienda</option>
          </CampoSelect>
        </div>
        <Boton
          type="submit"
          variante="secundario"
          disabled={pendiente}
          className="mb-0.5"
        >
          {pendiente ? "Aplicando…" : "Aplicar"}
        </Boton>
      </div>

      {iva === "10" ? (
        <p
          role="note"
          className="mt-3 border-l-4 border-senal bg-senal/10 px-3 py-2.5 text-sm leading-relaxed text-senal"
        >
          El 10 % solo se aplica a obras en viviendas que cumplan los requisitos
          legales. Confirma que tu caso cumple antes de continuar.
        </p>
      ) : null}

      {estado.error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-senal">
          {estado.error}
        </p>
      ) : null}

      {estado.ok ? (
        <p role="status" className="mt-3 text-sm font-medium text-confirmado">
          IVA actualizado.
        </p>
      ) : null}
    </form>
  );
}
