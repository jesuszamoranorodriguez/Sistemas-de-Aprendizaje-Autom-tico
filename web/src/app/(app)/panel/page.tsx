import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { InsigniaEstado } from "@/components/presupuestos/InsigniaEstado";
import { Aviso } from "@/components/ui/Aviso";
import { EnlaceBoton } from "@/components/ui/Boton";
import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";
import { formatearFecha } from "@/lib/format/fecha";
import { formatearEuros } from "@/lib/format/moneda";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel — Presupuesta",
};

type Props = {
  searchParams: Promise<{ datos?: string; contrasena?: string }>;
};

export default function Panel({ searchParams }: Props) {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <ContenidoPanel searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenidoPanel({ searchParams }: Props) {
  const { user, perfil } = await requerirSesion();

  if (!perfil || !perfilCompleto(perfil)) {
    redirect("/onboarding");
  }

  const supabase = await createClient();

  const [borradores, enviados, aceptados, facturados, recientes] =
    await Promise.all([
      supabase
        .from("presupuestos")
        .select("id", { count: "exact", head: true })
        .eq("estado", "borrador"),
      supabase
        .from("presupuestos")
        .select("id", { count: "exact", head: true })
        .eq("estado", "enviado"),
      supabase
        .from("presupuestos")
        .select("id", { count: "exact", head: true })
        .eq("estado", "aceptado"),
      supabase.from("presupuestos").select("total").eq("estado", "facturado"),
      supabase
        .from("presupuestos")
        .select(
          "id, titulo, estado, total, creado_en, actualizado_en, cliente:clientes(nombre)",
        )
        .order("actualizado_en", { ascending: false })
        .limit(5),
    ]);

  const totalFacturado = (facturados.data ?? []).reduce(
    (suma, fila) => suma + Number(fila.total),
    0,
  );

  const { datos, contrasena } = await searchParams;
  const iva = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
  }).format(Number(perfil.iva_defecto));

  const cifras = [
    {
      etiqueta: "Borradores",
      valor: String(borradores.count ?? 0),
      detalle: "en preparación",
    },
    {
      etiqueta: "Enviados",
      valor: String(enviados.count ?? 0),
      detalle: "esperando respuesta",
    },
    {
      etiqueta: "Aceptados",
      valor: String(aceptados.count ?? 0),
      detalle: "listos para facturar",
    },
    {
      etiqueta: "Facturado",
      valor: formatearEuros(totalFacturado),
      detalle: "total acumulado",
    },
  ];

  return (
    <main
      id="contenido"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            Hola, {perfil.nombre_comercial}.
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-tinta/70">
            Esto es lo que tienes entre manos. Los totales se calculan solos y
            nada sale hacia el cliente sin que lo valides tú.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <EnlaceBoton
            href="/panel/presupuestos/nuevo"
            variante="primario"
          >
            Nuevo presupuesto
          </EnlaceBoton>
          <EnlaceBoton
            href="/panel/presupuestos"
            variante="secundario"
          >
            Ver todos
          </EnlaceBoton>
        </div>
      </div>

      {datos === "guardados" ? (
        <Aviso tono="exito" className="mt-6">
          Datos fiscales guardados.
        </Aviso>
      ) : null}

      {contrasena === "actualizada" ? (
        <Aviso tono="exito" className="mt-6">
          Contraseña actualizada.
        </Aviso>
      ) : null}

      <section
        aria-label="Resumen de presupuestos"
        className="mt-8 border border-tinta"
      >
        <div className="grid grid-cols-2 gap-px bg-papel/15 sm:grid-cols-4">
          {cifras.map((cifra) => (
            <div key={cifra.etiqueta} className="bg-tinta p-5 text-papel">
              <p className="text-xs text-papel/65">{cifra.etiqueta}</p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums sm:text-3xl">
                {cifra.valor}
              </p>
              <p className="mt-1 text-[11px] text-papel/50">{cifra.detalle}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
        <section className="border border-tinta/20 bg-white p-6 shadow-[5px_5px_0_0_var(--color-linea)] sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Últimos presupuestos
            </h2>
            <Link
              href="/panel/presupuestos"
              className="text-sm font-medium text-plano underline-offset-4 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {recientes.data?.length ? (
            <ul className="mt-5 border-y border-tinta/15">
              {recientes.data.map((presupuesto) => (
                <li
                  key={presupuesto.id}
                  className="border-b border-tinta/10 last:border-b-0"
                >
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
                    <div className="mt-2 flex items-center gap-3">
                      <InsigniaEstado estado={presupuesto.estado} />
                      <span className="text-xs text-tinta/50">
                        {formatearFecha(presupuesto.actualizado_en)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 border border-dashed border-tinta/30 px-5 py-10 text-center">
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

          <p className="mt-5 text-xs leading-relaxed text-tinta/65">
            El cliente verá el presupuesto cuando tú decidas enviarlo. Hasta
            entonces, todo queda en tu cuenta.
          </p>
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Tus datos fiscales
            </h2>
            <Link
              href="/onboarding"
              className="text-sm font-medium text-plano underline-offset-4 hover:underline"
            >
              Editar
            </Link>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-tinta/10 pb-2.5">
              <dt className="text-tinta/60">Nombre fiscal</dt>
              <dd className="min-w-0 break-words text-right font-medium">
                {perfil.nombre_fiscal}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-tinta/10 pb-2.5">
              <dt className="text-tinta/60">NIF / CIF</dt>
              <dd className="text-right font-medium">{perfil.nif}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-tinta/10 pb-2.5">
              <dt className="text-tinta/60">IVA por defecto</dt>
              <dd className="text-right font-medium tabular-nums">{iva} %</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tinta/60">Cuenta</dt>
              <dd className="min-w-0 truncate text-right text-tinta/70">
                {user.email}
              </dd>
            </div>
          </dl>

          <Link
            href="/panel/clientes"
            className="mt-6 flex items-center justify-between gap-4 border border-tinta/20 bg-white px-4 py-3 text-sm font-semibold text-tinta transition-colors hover:border-tinta"
          >
            Gestionar clientes
          </Link>
        </section>
      </div>
    </main>
  );
}
