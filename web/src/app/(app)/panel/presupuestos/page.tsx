import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { InsigniaEstado } from "@/components/presupuestos/InsigniaEstado";
import { Aviso } from "@/components/ui/Aviso";
import { Boton, EnlaceBoton } from "@/components/ui/Boton";
import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";
import { formatearFecha } from "@/lib/format/fecha";
import { formatearEuros } from "@/lib/format/moneda";
import { esEstadoFiltrable, FILTROS_ESTADO } from "@/lib/presupuestos";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Presupuestos — Presupuesta",
};

type Props = {
  searchParams: Promise<{
    estado?: string;
    q?: string;
    eliminado?: string;
  }>;
};

export default function Presupuestos({ searchParams }: Props) {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <ContenidoPresupuestos searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenidoPresupuestos({ searchParams }: Props) {
  const { perfil } = await requerirSesion();

  if (!perfil || !perfilCompleto(perfil)) {
    redirect("/onboarding");
  }

  const parametros = await searchParams;
  const estado = esEstadoFiltrable(parametros.estado)
    ? parametros.estado
    : undefined;
  const q = (parametros.q ?? "").trim().slice(0, 80);
  const busqueda = q.replace(/[,()"]/g, " ").trim();

  const supabase = await createClient();

  let consulta = supabase
    .from("presupuestos")
    .select(
      "id, titulo, estado, total, creado_en, actualizado_en, cliente:clientes(nombre)",
    )
    .order("creado_en", { ascending: false });

  if (estado) {
    consulta = consulta.eq("estado", estado);
  }

  if (busqueda) {
    const { data: clientes } = await supabase
      .from("clientes")
      .select("id")
      .ilike("nombre", `%${busqueda}%`);

    const ids = (clientes ?? []).map((cliente) => cliente.id);
    const filtros = [`titulo.ilike.%${busqueda}%`];

    if (ids.length) {
      filtros.push(`cliente_id.in.(${ids.join(",")})`);
    }

    consulta = consulta.or(filtros.join(","));
  }

  const { data: presupuestos } = await consulta;
  const filas = presupuestos ?? [];

  const hayFiltros = Boolean(estado || q);

  const hrefFiltro = (valor: string) => {
    const parametrosFiltro = new URLSearchParams();

    if (valor) {
      parametrosFiltro.set("estado", valor);
    }

    if (q) {
      parametrosFiltro.set("q", q);
    }

    const cadena = parametrosFiltro.toString();

    return `/panel/presupuestos${cadena ? `?${cadena}` : ""}`;
  };

  return (
    <main
      id="contenido"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            Presupuestos
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-tinta/70">
            Todo lo que has presupuestado, con su estado y su total. Abre uno
            para revisar las partidas o cambiar el IVA.
          </p>
        </div>

        <EnlaceBoton href="/panel/presupuestos/nuevo">
          Nuevo presupuesto
        </EnlaceBoton>
      </div>

      {parametros.eliminado === "1" ? (
        <Aviso tono="exito" className="mt-6">
          Presupuesto eliminado.
        </Aviso>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTROS_ESTADO.map((filtro) => {
          const activo = (estado ?? "") === filtro.valor;

          return (
            <Link
              key={filtro.valor || "todos"}
              href={hrefFiltro(filtro.valor)}
              aria-current={activo ? "page" : undefined}
              className={`border px-3 py-1.5 text-sm font-medium transition-colors ${
                activo
                  ? "border-tinta bg-tinta text-papel"
                  : "border-tinta/25 bg-white text-tinta/70 hover:border-tinta hover:text-tinta"
              }`}
            >
              {filtro.etiqueta}
            </Link>
          );
        })}
      </div>

      <form
        method="get"
        action="/panel/presupuestos"
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        {estado ? <input type="hidden" name="estado" value={estado} /> : null}

        <label htmlFor="buscar-presupuestos" className="sr-only">
          Buscar presupuestos
        </label>
        <input
          id="buscar-presupuestos"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por título o cliente"
          className="min-w-0 flex-1 border border-tinta/25 bg-white px-3 py-2 text-base text-tinta placeholder:text-tinta/40 focus:border-plano sm:max-w-sm"
        />
        <Boton type="submit" variante="secundario">
          Buscar
        </Boton>

        {hayFiltros ? (
          <Link
            href="/panel/presupuestos"
            className="px-2 py-2 text-sm font-medium text-plano underline-offset-4 hover:underline"
          >
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-sm text-tinta/55">
          {filas.length}{" "}
          {filas.length === 1 ? "presupuesto" : "presupuestos"}
          {hayFiltros ? " con este filtro" : ""}
        </p>
      </div>

      {filas.length ? (
        <ul className="mt-2 border-t border-tinta/15">
          {filas.map((presupuesto) => (
            <li key={presupuesto.id} className="border-b border-tinta/10">
              <Link
                href={`/panel/presupuestos/${presupuesto.id}`}
                className="group block py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold group-hover:underline">
                      {presupuesto.titulo}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-tinta/60">
                      {presupuesto.cliente?.nombre ?? "Sin cliente"}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">
                    {formatearEuros(presupuesto.total)}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <InsigniaEstado estado={presupuesto.estado} />
                  <span className="text-xs text-tinta/50">
                    Creado el {formatearFecha(presupuesto.creado_en)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : hayFiltros ? (
        <div className="mt-2 border border-dashed border-tinta/30 px-5 py-10 text-center">
          <p className="font-semibold">No hay presupuestos con ese filtro.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta/65">
            Prueba con otro estado o quita la búsqueda para verlos todos.
          </p>
          <Link
            href="/panel/presupuestos"
            className="mt-5 inline-flex text-sm font-semibold text-plano underline-offset-4 hover:underline"
          >
            Ver todos
          </Link>
        </div>
      ) : (
        <div className="mt-2 border border-dashed border-tinta/30 px-5 py-10 text-center">
          <p className="font-semibold">Todavía no hay presupuestos.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta/65">
            Crea el primero a mano: pones las partidas, eliges el IVA y los
            totales se calculan solos.
          </p>
          <EnlaceBoton
            href="/panel/presupuestos/nuevo"
            className="mt-5"
          >
            Crear el primero
          </EnlaceBoton>
        </div>
      )}
    </main>
  );
}
