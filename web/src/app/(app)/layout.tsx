import { Suspense } from "react";
import Link from "next/link";

import { cerrarSesion } from "@/actions/auth";
import { NavPrincipal } from "@/components/layout/NavPrincipal";
import { obtenerSesion } from "@/lib/auth";

async function NombreCuenta() {
  const sesion = await obtenerSesion();
  const nombre =
    sesion?.perfil?.nombre_comercial?.trim() ||
    sesion?.user.email ||
    "Tu cuenta";

  return (
    <span className="hidden max-w-[22ch] truncate text-sm text-tinta/60 sm:block">
      {nombre}
    </span>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:bg-tinta focus:px-4 focus:py-2 focus:text-papel"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-tinta/15">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link
              href="/panel"
              className="text-lg font-extrabold tracking-tight"
            >
              Presupuesta
            </Link>

            <div className="flex items-center gap-4">
              <Suspense fallback={null}>
                <NombreCuenta />
              </Suspense>
              <form action={cerrarSesion}>
                <button
                  type="submit"
                  className="py-2 text-sm font-medium text-plano underline-offset-4 hover:underline"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-tinta/10">
            <NavPrincipal />
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-tinta/15">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-5 text-xs text-tinta/65 sm:flex-row sm:justify-between sm:px-8">
          <p className="font-semibold text-tinta/70">Presupuesta</p>
          <p>Los datos se guardan en tu cuenta y solo los ves tú.</p>
        </div>
      </footer>
    </div>
  );
}
