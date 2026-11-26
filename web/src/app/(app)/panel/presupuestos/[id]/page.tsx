import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import {
  confirmarPrecio,
  confirmarTodosPrecios,
  eliminarPartida,
} from "@/actions/partidas";
import {
  eliminarPresupuesto,
  validarPresupuesto,
} from "@/actions/presupuestos";
import { FormularioEditarPresupuesto } from "@/components/presupuestos/FormularioEditarPresupuesto";
import { FormularioPartida } from "@/components/presupuestos/FormularioPartida";
import { InsigniaConfianza } from "@/components/presupuestos/InsigniaConfianza";
import { InsigniaEstado } from "@/components/presupuestos/InsigniaEstado";
import { PrecioEstimado } from "@/components/presupuestos/PrecioEstimado";
import { SelectorIva } from "@/components/presupuestos/SelectorIva";
import { Aviso } from "@/components/ui/Aviso";
import { BotonConfirmar } from "@/components/ui/BotonConfirmar";
import { BotonEnvio } from "@/components/ui/BotonEnvio";
import { clasesBoton, EnlaceBoton } from "@/components/ui/Boton";
import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";
import { formatearFecha } from "@/lib/format/fecha";
import { formatearCantidad, formatearEuros } from "@/lib/format/moneda";
import {
  esEditable,
  ETIQUETAS_ESTADO,
  ETIQUETAS_TIPO,
} from "@/lib/presupuestos";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Presupuesto — Presupuesta",
};

type Tono = "exito" | "error" | "aviso" | "info";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    creado?: string;
    validado?: string;
    datos?: string;
    linea?: string;
    precios?: string;
    aviso?: string;
    editar?: string;
    nueva?: string;
  }>;
};

const AVISOS: Record<string, { tono: Tono; texto: string }> = {
  "sin-partidas": {
    tono: "error",
    texto: "Añade al menos una partida antes de validar el presupuesto.",
  },
  "no-borrador": {
    tono: "error",
    texto: "Este presupuesto ya no está en borrador.",
  },
  "no-validado": {
    tono: "error",
    texto: "No hemos podido validar el presupuesto. Inténtalo de nuevo.",
  },
  protegido: {
    tono: "error",
    texto:
      "No se puede modificar: el presupuesto ya está aceptado o facturado.",
  },
  "no-eliminada": {
    tono: "error",
    texto: "No hemos podido quitar la partida. Inténtalo de nuevo.",
  },
  "no-confirmada": {
    tono: "error",
    texto: "No hemos podido confirmar el precio. Inténtalo de nuevo.",
  },
  "no-eliminado": {
    tono: "error",
    texto: "No hemos podido eliminar el presupuesto. Inténtalo de nuevo.",
  },
  "no-existe": {
    tono: "error",
    texto: "Ese presupuesto ya no existe.",
  },
};

export default function Presupuesto({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <ContenidoPresupuesto params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenidoPresupuesto({ params, searchParams }: Props) {
  const { id } = await params;

  const { perfil } = await requerirSesion();

  if (!perfil || !perfilCompleto(perfil)) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: presupuesto } = await supabase
    .from("presupuestos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!presupuesto) {
    notFound();
  }

  const { data: cliente } = presupuesto.cliente_id
    ? await supabase
        .from("clientes")
        .select("*")
        .eq("id", presupuesto.cliente_id)
        .maybeSingle()
    : { data: null };

  const [{ data: partidas }, { data: clientes }] = await Promise.all([
    supabase
      .from("partidas")
      .select("*")
      .eq("presupuesto_id", id)
      .order("orden", { ascending: true })
      .order("creado_en", { ascending: true }),
    supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre", { ascending: true }),
  ]);

  const parametros = await searchParams;
  const lineas = partidas ?? [];
  const partidaEditada = parametros.editar
    ? lineas.find((partida) => partida.id === parametros.editar)
    : undefined;
  const mostrarFormulario = Boolean(
    parametros.nueva === "1" || partidaEditada,
  );
  const editable = esEditable(presupuesto.estado);
  const sinConfirmar = lineas.filter(
    (partida) => !partida.precio_confirmado,
  ).length;
  const hayEstimados = sinConfirmar > 0;
  const urlBase = `/panel/presupuestos/${id}`;

  const mensajes: { tono: Tono; texto: string }[] = [];

  if (parametros.creado === "1") {
    mensajes.push({
      tono: "exito",
      texto: "Presupuesto creado. Ahora añade las partidas.",
    });
  }

  if (parametros.validado === "1") {
    mensajes.push({
      tono: "exito",
      texto: "Presupuesto validado. Queda listo para enviar al cliente.",
    });
  }

  if (parametros.datos === "actualizados") {
    mensajes.push({
      tono: "exito",
      texto: "Datos del presupuesto actualizados.",
    });
  }

  if (parametros.linea === "anadida") {
    mensajes.push({ tono: "exito", texto: "Partida añadida." });
  }

  if (parametros.linea === "actualizada") {
    mensajes.push({ tono: "exito", texto: "Partida actualizada." });
  }

  if (parametros.linea === "eliminada") {
    mensajes.push({ tono: "exito", texto: "Partida eliminada." });
  }

  if (parametros.linea === "confirmada") {
    mensajes.push({ tono: "exito", texto: "Precio confirmado." });
  }

  if (parametros.precios === "confirmados") {
    mensajes.push({
      tono: "exito",
      texto: "Todos los precios están confirmados.",
    });
  }

  if (parametros.aviso && AVISOS[parametros.aviso]) {
    mensajes.push(AVISOS[parametros.aviso]);
  }

  const direccionCliente = cliente
    ? [cliente.direccion, cliente.cp, cliente.ciudad].filter(Boolean).join(", ")
    : "";

  return (
    <main
      id="contenido"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14"
    >
      <Link
        href="/panel/presupuestos"
        className="text-sm font-medium text-plano underline-offset-4 hover:underline"
      >
        ← Presupuestos
      </Link>

      <div className="mt-4">
        <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
          {presupuesto.titulo}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <InsigniaEstado estado={presupuesto.estado} />
          <span className="text-sm text-tinta/55">
            Nº {presupuesto.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-sm text-tinta/55">
            Creado el {formatearFecha(presupuesto.creado_en)}
          </span>
          <span className="text-sm text-tinta/55">
            Válido {presupuesto.validez_dias} días
          </span>
        </div>
      </div>

      {mensajes.map((mensaje) => (
        <Aviso key={mensaje.texto} tono={mensaje.tono} className="mt-6">
          {mensaje.texto}
        </Aviso>
      ))}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="border border-tinta/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-tinta/60">Cliente</h2>
          {cliente ? (
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold">{cliente.nombre}</p>
              {cliente.nif ? (
                <p className="text-tinta/60">NIF {cliente.nif}</p>
              ) : null}
              {cliente.telefono ? (
                <p className="text-tinta/60">{cliente.telefono}</p>
              ) : null}
              {cliente.email ? (
                <p className="break-all text-tinta/60">{cliente.email}</p>
              ) : null}
              {direccionCliente ? (
                <p className="text-tinta/60">{direccionCliente}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-tinta/60">
              Sin cliente asignado.
            </p>
          )}
        </section>

        <section className="border border-tinta/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-tinta/60">Avería</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-tinta/80">
            {presupuesto.descripcion_averia?.trim() || "Sin descripción."}
          </p>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
        <section id="partidas" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Partidas
              </h2>
              <p className="mt-0.5 text-sm text-tinta/55">
                {lineas.length}{" "}
                {lineas.length === 1 ? "línea" : "líneas"}
              </p>
            </div>

            {editable && !mostrarFormulario ? (
              <EnlaceBoton
                href={`${urlBase}?nueva=1#partidas`}
                variante="secundario"
              >
                Añadir partida
              </EnlaceBoton>
            ) : null}
          </div>

          {mostrarFormulario && editable ? (
            <div className="mt-5 border border-plano/40 bg-plano/5 p-5 sm:p-6">
              <h3 className="font-extrabold">
                {partidaEditada ? "Editar partida" : "Nueva partida"}
              </h3>
              <div className="mt-4">
                <FormularioPartida
                  presupuestoId={id}
                  partida={
                    partidaEditada
                      ? {
                          id: partidaEditada.id,
                          tipo: partidaEditada.tipo,
                          descripcion: partidaEditada.descripcion,
                          cantidad: Number(partidaEditada.cantidad),
                          unidad: partidaEditada.unidad,
                          precio_unitario: Number(
                            partidaEditada.precio_unitario,
                          ),
                        }
                      : undefined
                  }
                  hrefCancelar={`${urlBase}#partidas`}
                />
              </div>
            </div>
          ) : null}

          {lineas.length ? (
            <ol className="mt-6 border-t border-tinta/15">
              {lineas.map((partida, indice) => (
                <li
                  key={partida.id}
                  className="border-b border-tinta/10 py-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="w-6 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-tinta/40">
                      {String(indice + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{partida.descripcion}</p>
                        {!partida.precio_confirmado ? (
                          <PrecioEstimado />
                        ) : null}
                        <InsigniaConfianza confianza={partida.confianza} />
                      </div>

                      <p className="mt-1 text-sm text-tinta/60">
                        {ETIQUETAS_TIPO[partida.tipo]},{" "}
                        {formatearCantidad(partida.cantidad)} {partida.unidad} ×{" "}
                        {formatearEuros(partida.precio_unitario)}
                      </p>

                      {editable ? (
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <Link
                            href={`${urlBase}?editar=${partida.id}#partidas`}
                            className={clasesBoton("sutil")}
                          >
                            Editar
                          </Link>

                          {!partida.precio_confirmado ? (
                            <form action={confirmarPrecio}>
                              <input
                                type="hidden"
                                name="presupuesto_id"
                                value={id}
                              />
                              <input
                                type="hidden"
                                name="id"
                                value={partida.id}
                              />
                              <BotonEnvio
                                variante="sutil"
                                pendienteTexto="Confirmando…"
                              >
                                Confirmar precio
                              </BotonEnvio>
                            </form>
                          ) : null}

                          <form action={eliminarPartida}>
                            <input
                              type="hidden"
                              name="presupuesto_id"
                              value={id}
                            />
                            <input
                              type="hidden"
                              name="id"
                              value={partida.id}
                            />
                            <BotonConfirmar
                              mensaje="¿Quitar esta partida del presupuesto?"
                              pendienteTexto="Quitando…"
                              variante="sutilPeligro"
                            >
                              Quitar
                            </BotonConfirmar>
                          </form>
                        </div>
                      ) : null}
                    </div>

                    <p className="shrink-0 text-right font-semibold tabular-nums">
                      {formatearEuros(partida.importe)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-6 border border-dashed border-tinta/30 px-5 py-10 text-center">
              <p className="font-semibold">Todavía no hay partidas.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta/65">
                Añade materiales, mano de obra o desplazamiento. El total se
                calcula solo con el IVA que elijas.
              </p>
              {editable && !mostrarFormulario ? (
                <EnlaceBoton
                  href={`${urlBase}?nueva=1#partidas`}
                  className="mt-5"
                >
                  Añadir la primera
                </EnlaceBoton>
              ) : null}
            </div>
          )}

          {!editable ? (
            <Aviso tono="info" className="mt-6">
              {presupuesto.estado === "generando"
                ? "El presupuesto se está generando. Espera a que termine para revisarlo."
                : `Este presupuesto ya está ${ETIQUETAS_ESTADO[
                    presupuesto.estado
                  ].toLowerCase()} y no admite cambios.`}
            </Aviso>
          ) : null}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-6">
          <section
            id="totales"
            className="border border-tinta/20 bg-white p-6 shadow-[5px_5px_0_0_var(--color-linea)]"
          >
            <h2 className="text-lg font-extrabold tracking-tight">Totales</h2>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-tinta/60">Base imponible</dt>
                <dd className="font-medium tabular-nums">
                  {formatearEuros(presupuesto.base_imponible)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tinta/60">
                  IVA ({Number(presupuesto.iva_porcentaje)} %)
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatearEuros(presupuesto.cuota_iva)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-tinta pt-4">
              <p className="font-extrabold">Total</p>
              <p className="text-2xl font-extrabold tabular-nums">
                {formatearEuros(presupuesto.total)}
              </p>
            </div>

            {editable ? (
              <SelectorIva
                presupuestoId={id}
                ivaActual={Number(presupuesto.iva_porcentaje)}
              />
            ) : null}

            {presupuesto.requiere_visita ? (
              <Aviso tono="aviso" className="mt-4">
                Hay partidas de confianza baja. Conviene una visita presencial
                antes de cerrar el presupuesto.
              </Aviso>
            ) : null}

            {hayEstimados ? (
              <div className="mt-4 border border-senal/40 bg-senal/5 p-4">
                <p className="text-sm font-semibold text-senal">
                  {sinConfirmar}{" "}
                  {sinConfirmar === 1
                    ? "precio estimado"
                    : "precios estimados"}{" "}
                  sin confirmar
                </p>
                <p className="mt-1 text-sm leading-relaxed text-tinta/70">
                  Revísalos antes de enviar el presupuesto al cliente.
                </p>
                {editable ? (
                  <form action={confirmarTodosPrecios} className="mt-3">
                    <input
                      type="hidden"
                      name="presupuesto_id"
                      value={id}
                    />
                    <BotonEnvio
                      variante="secundario"
                      pendienteTexto="Confirmando…"
                    >
                      Confirmar todos
                    </BotonEnvio>
                  </form>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 space-y-3 border-t border-tinta/10 pt-5">
              {presupuesto.estado === "borrador" ? (
                lineas.length ? (
                  <form action={validarPresupuesto}>
                    <input
                      type="hidden"
                      name="presupuesto_id"
                      value={id}
                    />
                    <BotonEnvio
                      className="w-full"
                      pendienteTexto="Validando…"
                    >
                      Validar presupuesto
                    </BotonEnvio>
                  </form>
                ) : (
                  <p className="text-sm leading-relaxed text-tinta/60">
                    Añade al menos una partida para poder validar el
                    presupuesto.
                  </p>
                )
              ) : null}

              {presupuesto.estado === "revisado" ? (
                <p className="text-sm leading-relaxed text-tinta/65">
                  Validado. Puedes seguir ajustando las partidas mientras no lo
                  envíes.
                </p>
              ) : null}

              {presupuesto.estado === "enviado" ? (
                <Aviso tono="info">
                  Enviado al cliente. Esperando respuesta.
                </Aviso>
              ) : null}

              {presupuesto.estado === "aceptado" ? (
                <Aviso tono="exito">
                  El cliente lo ha aceptado. La factura llegará en la siguiente
                  fase.
                </Aviso>
              ) : null}

              {presupuesto.estado === "rechazado" ? (
                <Aviso tono="aviso">El cliente lo ha rechazado.</Aviso>
              ) : null}

              {presupuesto.estado === "caducado" ? (
                <Aviso tono="info">Caducó sin respuesta.</Aviso>
              ) : null}

              {presupuesto.estado === "facturado" ? (
                <Aviso tono="exito">Presupuesto facturado.</Aviso>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      {editable ? (
        <details className="mt-10 border border-tinta/20 bg-white p-5 sm:p-6">
          <summary className="cursor-pointer text-sm font-semibold text-plano">
            Editar datos del presupuesto
          </summary>
          <div className="mt-5">
            <FormularioEditarPresupuesto
              presupuesto={{
                id: presupuesto.id,
                titulo: presupuesto.titulo,
                descripcion_averia: presupuesto.descripcion_averia,
                cliente_id: presupuesto.cliente_id,
                validez_dias: presupuesto.validez_dias,
              }}
              clientes={clientes ?? []}
            />
          </div>
        </details>
      ) : null}

      {editable ? (
        <section className="mt-10 border-t border-tinta/15 pt-6">
          <h2 className="text-sm font-semibold text-tinta/70">
            Eliminar presupuesto
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-tinta/55">
            Se borrarán también sus partidas. No se puede deshacer.
          </p>
          <form action={eliminarPresupuesto} className="mt-3">
            <input type="hidden" name="presupuesto_id" value={id} />
            <BotonConfirmar
              mensaje="¿Eliminar este presupuesto y todas sus partidas?"
              pendienteTexto="Eliminando…"
            >
              Eliminar presupuesto
            </BotonConfirmar>
          </form>
        </section>
      ) : null}

      <div className="mt-10 border-t border-tinta/15 pt-6">
        <Link
          href="/panel/presupuestos"
          className="text-sm font-medium text-plano underline-offset-4 hover:underline"
        >
          ← Volver a la lista
        </Link>
      </div>
    </main>
  );
}
