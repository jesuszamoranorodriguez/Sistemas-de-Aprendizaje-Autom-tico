"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  crearPresupuesto,
  type EstadoNuevoPresupuesto,
} from "@/actions/presupuestos";
import { Aviso } from "@/components/ui/Aviso";
import { Boton, clasesBoton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoArea } from "@/components/ui/CampoArea";
import { CampoSelect } from "@/components/ui/CampoSelect";

const ESTADO_INICIAL: EstadoNuevoPresupuesto = {};

type Props = {
  clientes: { id: string; nombre: string }[];
  ivaDefecto: number;
};

export function FormularioNuevoPresupuesto({ clientes, ivaDefecto }: Props) {
  const [estado, accion, pendiente] = useActionState(
    crearPresupuesto,
    ESTADO_INICIAL,
  );
  const valores = estado.valores ?? {};
  const errores = estado.campos ?? {};

  const valor = (clave: string, porDefecto = "") =>
    clave in valores ? (valores[clave] ?? "") : porDefecto;

  const [modo, setModo] = useState<"existente" | "nuevo">(
    clientes.length ? "existente" : "nuevo",
  );
  const [iva, setIva] = useState(
    valores.iva_porcentaje ?? String(ivaDefecto),
  );

  const hayClientes = clientes.length > 0;

  return (
    <form action={accion} className="space-y-10" noValidate>
      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <fieldset className="border-t border-tinta/20 pt-6">
        <legend className="text-base font-extrabold tracking-tight">
          Qué vas a presupuestar
        </legend>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">
          Un título claro y la avería explicada con tus palabras. El cliente lo
          verá tal cual.
        </p>

        <div className="mt-5 space-y-5">
          <Campo
            id="nuevo-titulo"
            name="titulo"
            etiqueta="Título *"
            ayuda="Por ejemplo, «Cambio de grifería en la cocina»."
            defaultValue={valor("titulo")}
            maxLength={160}
            error={errores.titulo}
            required
          />
          <CampoArea
            id="nuevo-descripcion"
            name="descripcion_averia"
            etiqueta="Descripción de la avería"
            ayuda="Qué has visto, qué hace falta y cualquier detalle que ayude a entenderlo."
            defaultValue={valor("descripcion_averia")}
            maxLength={2000}
            error={errores.descripcion_averia}
          />
        </div>
      </fieldset>

      <fieldset className="border-t border-tinta/20 pt-6">
        <legend className="text-base font-extrabold tracking-tight">
          Para quién es
        </legend>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">
          Puedes elegir un cliente guardado o crearlo aquí mismo. Quedará en tu
          lista para el próximo presupuesto.
        </p>

        <div
          role="radiogroup"
          aria-label="Tipo de cliente"
          className="mt-5 grid grid-cols-2 border border-tinta/25 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-plano"
        >
          <label
            className={`flex items-center justify-center px-3 py-2.5 text-sm font-semibold transition-colors ${
              modo === "existente"
                ? "bg-tinta text-papel"
                : "bg-white text-tinta/70 hover:bg-tinta/5"
            } ${hayClientes ? "cursor-pointer" : "cursor-not-allowed opacity-45"}`}
          >
            <input
              type="radio"
              name="modo_cliente"
              value="existente"
              checked={modo === "existente"}
              onChange={() => setModo("existente")}
              className="sr-only"
              disabled={!hayClientes}
            />
            Ya es cliente
          </label>
          <label
            className={`flex cursor-pointer items-center justify-center px-3 py-2.5 text-sm font-semibold transition-colors ${
              modo === "nuevo"
                ? "bg-tinta text-papel"
                : "bg-white text-tinta/70 hover:bg-tinta/5"
            }`}
          >
            <input
              type="radio"
              name="modo_cliente"
              value="nuevo"
              checked={modo === "nuevo"}
              onChange={() => setModo("nuevo")}
              className="sr-only"
            />
            Cliente nuevo
          </label>
        </div>

        {!hayClientes ? (
          <p className="mt-3 text-sm text-tinta/60">
            Todavía no tienes clientes guardados. Crea el primero aquí mismo.
          </p>
        ) : null}

        {modo === "existente" && hayClientes ? (
          <div className="mt-5">
            <CampoSelect
              id="nuevo-cliente"
              name="cliente_id"
              etiqueta="Cliente"
              defaultValue={valor("cliente_id", clientes[0]?.id ?? "")}
              error={errores.cliente_id}
            >
              <option value="">Elige un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </CampoSelect>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Campo
                id="nuevo-cliente-nombre"
                name="cliente_nombre"
                etiqueta="Nombre del cliente *"
                defaultValue={valor("cliente_nombre")}
                maxLength={160}
                error={errores.cliente_nombre}
                required
              />
            </div>
            <Campo
              id="nuevo-cliente-nif"
              name="cliente_nif"
              etiqueta="NIF o CIF"
              ayuda="Opcional, pero necesario para la factura."
              defaultValue={valor("cliente_nif")}
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={20}
              error={errores.cliente_nif}
            />
            <Campo
              id="nuevo-cliente-telefono"
              name="cliente_telefono"
              type="tel"
              etiqueta="Teléfono"
              defaultValue={valor("cliente_telefono")}
              autoComplete="tel"
              inputMode="tel"
              maxLength={30}
              error={errores.cliente_telefono}
            />
            <div className="sm:col-span-2">
              <Campo
                id="nuevo-cliente-email"
                name="cliente_email"
                type="email"
                etiqueta="Correo electrónico"
                defaultValue={valor("cliente_email")}
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                error={errores.cliente_email}
              />
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="border-t border-tinta/20 pt-6">
        <legend className="text-base font-extrabold tracking-tight">
          Condiciones
        </legend>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">
          El IVA se aplica al total. Puedes cambiarlo en cualquier momento
          mientras el presupuesto siga en borrador.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <CampoSelect
              id="nuevo-iva"
              name="iva_porcentaje"
              etiqueta="IVA"
              value={iva}
              onChange={(evento) => setIva(evento.target.value)}
              error={errores.iva_porcentaje}
            >
              <option value="21">21 % — tipo general</option>
              <option value="10">10 % — obras en vivienda</option>
            </CampoSelect>
            {iva === "10" ? (
              <p
                role="note"
                className="mt-3 border-l-4 border-senal bg-senal/10 px-3 py-2.5 text-sm leading-relaxed text-senal"
              >
                El 10 % solo se aplica a obras en viviendas que cumplan los
                requisitos legales. Confirma que tu caso cumple antes de
                continuar.
              </p>
            ) : null}
          </div>

          <Campo
            id="nuevo-validez"
            name="validez_dias"
            type="number"
            etiqueta="Validez (días)"
            ayuda="Cuánto tiempo tiene el cliente para aceptarlo."
            defaultValue={valor("validez_dias", "15")}
            inputMode="numeric"
            min={1}
            max={365}
            error={errores.validez_dias}
            required
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-tinta/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-tinta/60">
          Los campos con * son obligatorios.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/panel/presupuestos" className={clasesBoton("sutil")}>
            Cancelar
          </Link>
          <Boton type="submit" disabled={pendiente}>
            {pendiente ? "Creando…" : "Crear presupuesto y añadir partidas"}
          </Boton>
        </div>
      </div>
    </form>
  );
}
