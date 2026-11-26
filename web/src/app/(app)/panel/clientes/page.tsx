import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DialogoCliente } from "@/components/clientes/DialogoCliente";
import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Clientes — Presupuesta",
};

export default function Clientes() {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <ContenidoClientes />
    </Suspense>
  );
}

async function ContenidoClientes() {
  const { perfil } = await requerirSesion();

  if (!perfil || !perfilCompleto(perfil)) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true });

  return (
    <main
      id="contenido"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            Clientes
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-tinta/70">
            Guarda aquí a quien presupuestas. Los tendrás a mano la próxima vez
            y el NIF quedará listo para la factura.
          </p>
        </div>

        <DialogoCliente etiqueta="Nuevo cliente" />
      </div>

      {clientes?.length ? (
        <>
          <p className="mt-8 text-sm text-tinta/55">
            {clientes.length}{" "}
            {clientes.length === 1 ? "cliente guardado" : "clientes guardados"}
          </p>

          <ul className="mt-2 border-t border-tinta/15">
            {clientes.map((cliente) => {
              const direccion = [cliente.direccion, cliente.cp, cliente.ciudad]
                .filter(Boolean)
                .join(", ");

              return (
                <li
                  key={cliente.id}
                  className="border-b border-tinta/10 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{cliente.nombre}</p>

                      {cliente.telefono || cliente.email ? (
                        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta/60">
                          {cliente.telefono ? (
                            <span>{cliente.telefono}</span>
                          ) : null}
                          {cliente.email ? (
                            <span className="break-all">{cliente.email}</span>
                          ) : null}
                        </div>
                      ) : null}

                      {direccion ? (
                        <p className="mt-1 text-sm text-tinta/50">
                          {direccion}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-4">
                      {cliente.nif ? (
                        <span className="text-sm text-tinta/55 tabular-nums">
                          {cliente.nif}
                        </span>
                      ) : null}
                      <DialogoCliente
                        cliente={cliente}
                        etiqueta="Editar"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="mt-8 border border-dashed border-tinta/30 px-5 py-12 text-center">
          <p className="font-semibold">Todavía no hay clientes.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta/65">
            Puedes crearlos aquí o directamente al hacer un presupuesto. Si los
            guardas ahora, los tendrás a mano después.
          </p>
          <div className="mt-5 flex justify-center">
            <DialogoCliente etiqueta="Crear el primero" />
          </div>
        </div>
      )}

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-tinta/60">
        Los datos de tus clientes solo los ves tú. El NIF y la dirección se
        usarán en la factura cuando acepten un presupuesto.
      </p>
    </main>
  );
}
