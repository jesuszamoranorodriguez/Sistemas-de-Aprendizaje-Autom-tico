import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";

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

  const { datos, contrasena } = await searchParams;
  const direccion = [perfil.direccion, `${perfil.cp} ${perfil.ciudad}`, perfil.provincia]
    .filter(Boolean)
    .join(", ");
  const iva = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
  }).format(Number(perfil.iva_defecto));

  return (
    <main id="contenido" className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            Hola, {perfil.nombre_comercial}.
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-tinta/70">
            Tu cuenta está lista. Los presupuestos son el siguiente paso y
            aparecerán en esta misma pantalla.
          </p>
        </div>
        <p className="text-sm text-tinta/65">{user.email}</p>
      </div>

      {datos === "guardados" ? (
        <p
          role="status"
          className="mt-6 border-l-4 border-confirmado bg-confirmado/10 px-3 py-2.5 text-sm font-medium text-confirmado"
        >
          Datos fiscales guardados.
        </p>
      ) : null}

      {contrasena === "actualizada" ? (
        <p
          role="status"
          className="mt-6 border-l-4 border-confirmado bg-confirmado/10 px-3 py-2.5 text-sm font-medium text-confirmado"
        >
          Contraseña actualizada.
        </p>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
        <section className="border border-tinta/20 bg-white p-6 shadow-[5px_5px_0_0_var(--color-linea)] sm:p-8">
          <h2 className="text-lg font-extrabold tracking-tight">Presupuestos</h2>
          <div className="mt-5 border border-dashed border-tinta/30 px-5 py-10 text-center">
            <p className="font-semibold">Todavía no hay ninguno.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta/65">
              Cuando puedas crear el primero, aparecerá aquí con su estado:
              borrador, enviado, aceptado o facturado.
            </p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-tinta/65">
            La creación de presupuestos se está terminando. Tu cuenta y tus
            datos ya están preparados.
          </p>
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Datos fiscales
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
              <dt className="text-tinta/60">Dirección</dt>
              <dd className="max-w-[24ch] min-w-0 break-words text-right">
                {direccion}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-tinta/10 pb-2.5">
              <dt className="text-tinta/60">Teléfono</dt>
              <dd className="text-right">
                {perfil.telefono || "Sin teléfono"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-tinta/10 pb-2.5">
              <dt className="text-tinta/60">IVA por defecto</dt>
              <dd className="text-right font-medium tabular-nums">
                {iva} %
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tinta/60">Serie de factura</dt>
              <dd className="text-right font-medium">
                {perfil.serie_factura_defecto}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
