"use client";

import { useActionState } from "react";

import {
  actualizarPresupuesto,
  type EstadoEditarPresupuesto,
} from "@/actions/presupuestos";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoArea } from "@/components/ui/CampoArea";
import { CampoSelect } from "@/components/ui/CampoSelect";
import { EnfocarErrores } from "@/components/ui/EnfocarErrores";

const ESTADO_INICIAL: EstadoEditarPresupuesto = {};

type Props = {
  presupuesto: {
    id: string;
    titulo: string;
    descripcion_averia: string | null;
    cliente_id: string | null;
    validez_dias: number;
  };
  clientes: { id: string; nombre: string }[];
};

export function FormularioEditarPresupuesto({ presupuesto, clientes }: Props) {
  const [estado, accion, pendiente] = useActionState(
    actualizarPresupuesto,
    ESTADO_INICIAL,
  );
  const valores = estado.valores ?? {};
  const errores = estado.campos ?? {};

  const valor = (clave: keyof Props["presupuesto"], porDefecto = "") => {
    if (clave in valores) {
      return valores[clave] ?? "";
    }

    const original = presupuesto[clave];

    return original === null || original === undefined
      ? porDefecto
      : String(original);
  };

  return (
    <form action={accion} className="space-y-5" noValidate>
      <input type="hidden" name="presupuesto_id" value={presupuesto.id} />

      <EnfocarErrores errores={estado.campos} />
      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Campo
            id="editar-titulo"
            name="titulo"
            etiqueta="Título *"
            defaultValue={valor("titulo")}
            maxLength={160}
            error={errores.titulo}
            required
          />
        </div>

        <CampoSelect
          id="editar-cliente"
          name="cliente_id"
          etiqueta="Cliente"
          defaultValue={valor("cliente_id")}
          error={errores.cliente_id}
        >
          <option value="">Elige un cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </CampoSelect>

        <Campo
          id="editar-validez"
          name="validez_dias"
          type="number"
          etiqueta="Validez (días)"
          defaultValue={valor("validez_dias")}
          inputMode="numeric"
          min={1}
          max={365}
          error={errores.validez_dias}
          required
        />

        <div className="sm:col-span-2">
          <CampoArea
            id="editar-descripcion"
            name="descripcion_averia"
            etiqueta="Descripción de la avería"
            defaultValue={valor("descripcion_averia")}
            maxLength={2000}
            rows={3}
            error={errores.descripcion_averia}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Boton type="submit" variante="secundario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar datos"}
        </Boton>
      </div>
    </form>
  );
}
