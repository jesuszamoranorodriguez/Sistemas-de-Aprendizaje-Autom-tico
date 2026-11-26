import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { FormularioNuevoPresupuesto } from "@/components/presupuestos/FormularioNuevoPresupuesto";
import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nuevo presupuesto — Presupuesta",
};

export default function NuevoPresupuesto() {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <ContenidoNuevoPresupuesto />
    </Suspense>
  );
}

async function ContenidoNuevoPresupuesto() {
  const { perfil } = await requerirSesion();

  if (!perfil || !perfilCompleto(perfil)) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  return (
    <main
      id="contenido"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14"
    >
      <Link
        href="/panel/presupuestos"
        className="text-sm font-medium text-plano underline-offset-4 hover:underline"
      >
        ← Volver a presupuestos
      </Link>

      <div className="mt-4">
        <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
          Nuevo presupuesto
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-tinta/70">
          Pon los datos y el cliente. Después añadirás las partidas y verás el
          total con IVA calculado solo.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start lg:gap-10">
        <section className="border border-tinta/20 bg-white p-6 shadow-[5px_5px_0_0_var(--color-linea)] sm:p-8">
          <FormularioNuevoPresupuesto
            clientes={clientes ?? []}
            ivaDefecto={Number(perfil.iva_defecto)}
          />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="border border-tinta/20 bg-white p-6">
            <h2 className="text-base font-extrabold tracking-tight">
              Qué pasa al crearlo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-tinta/70">
              Pasarás a la pantalla del presupuesto. Allí añades las partidas
              una a una y el total se recalcula solo. No se envía nada al
              cliente hasta que tú lo valides y decidas enviarlo.
            </p>
          </section>

          <section className="border border-tinta/20 bg-white p-6">
            <h2 className="text-base font-extrabold tracking-tight">
              Tus datos en el presupuesto
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-tinta/60">Nombre comercial</dt>
                <dd className="min-w-0 break-words text-right font-medium">
                  {perfil.nombre_comercial}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tinta/60">NIF / CIF</dt>
                <dd className="text-right font-medium">{perfil.nif}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tinta/60">IVA por defecto</dt>
                <dd className="text-right font-medium tabular-nums">
                  {Number(perfil.iva_defecto)} %
                </dd>
              </div>
            </dl>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex text-sm font-medium text-plano underline-offset-4 hover:underline"
            >
              Editar datos fiscales
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
