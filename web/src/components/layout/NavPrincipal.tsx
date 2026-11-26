"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const ENLACES = [
  { href: "/panel", etiqueta: "Panel" },
  { href: "/panel/presupuestos", etiqueta: "Presupuestos" },
  { href: "/panel/clientes", etiqueta: "Clientes" },
  { href: "/onboarding", etiqueta: "Datos fiscales" },
];

function ListaEnlaces({ ruta }: { ruta?: string }) {
  return (
    <ul className="flex items-center gap-1 py-1">
      {ENLACES.map((enlace) => {
        const activo = ruta
          ? enlace.href === "/panel"
            ? ruta === "/panel"
            : ruta.startsWith(enlace.href)
          : false;

        return (
          <li key={enlace.href}>
            <Link
              href={enlace.href}
              aria-current={activo ? "page" : undefined}
              className={`block whitespace-nowrap px-2 py-2 text-sm font-medium transition-colors sm:px-3 ${
                activo
                  ? "bg-tinta text-papel"
                  : "text-tinta/70 hover:bg-tinta/5 hover:text-tinta"
              }`}
            >
              {enlace.etiqueta}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function EnlacesConRuta() {
  const ruta = usePathname();

  return <ListaEnlaces ruta={ruta} />;
}

export function NavPrincipal() {
  return (
    <nav aria-label="Principal" className="overflow-x-auto">
      <Suspense fallback={<ListaEnlaces />}>
        <EnlacesConRuta />
      </Suspense>
    </nav>
  );
}
