import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioOnboarding } from "@/components/perfil/FormularioOnboarding";
import { EsqueletoPagina } from "@/components/ui/EsqueletoPagina";
import { perfilCompleto, requerirSesion } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Datos fiscales — Presupuesta",
};

export default function Onboarding() {
  return (
    <Suspense fallback={<EsqueletoPagina />}>
      <ContenidoOnboarding />
    </Suspense>
  );
}

async function ContenidoOnboarding() {
  const { user, perfil } = await requerirSesion();
  const completo = perfilCompleto(perfil);

  return (
    <main id="contenido" className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
      <h1 className="text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
        {completo ? "Tus datos fiscales." : "Antes del primer presupuesto."}
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-tinta/75">
        {completo
          ? "Estos son los datos que aparecen en tus presupuestos y facturas. Si algo cambia, edítalo aquí y se usará en los siguientes."
          : "Necesitamos tus datos fiscales para que los presupuestos y las facturas salgan con tu nombre. Solo se rellenan una vez."}
      </p>

      <FormularioOnboarding
        perfil={perfil}
        emailCuenta={user.email ?? ""}
        completo={completo}
      />
    </main>
  );
}
