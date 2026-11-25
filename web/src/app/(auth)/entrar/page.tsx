import type { Metadata } from "next";
import Link from "next/link";

import { FormularioAcceso } from "@/components/auth/FormularioAcceso";

export const instant = false;

export const metadata: Metadata = {
  title: "Entrar — Presupuesta",
};

type Props = {
  searchParams: Promise<{ error?: string; siguiente?: string }>;
};

export default async function Entrar({ searchParams }: Props) {
  const { error, siguiente } = await searchParams;
  const enlaceCaducado = error === "enlace";

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="fondo-taller flex flex-col justify-between bg-tinta px-5 py-7 text-papel sm:px-8 lg:px-12 lg:py-10">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-papel"
        >
          Presupuesta
        </Link>

        <div className="mt-10 max-w-md lg:mt-0">
          <h2 className="text-balance text-2xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-3xl lg:text-4xl">
            Del aviso del cliente al presupuesto aceptado.
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-papel/70">
            Tu cuenta guarda los datos fiscales, las fotos de la avería y cada
            presupuesto. Nada sale hacia el cliente sin tu visto bueno.
          </p>

          <ul className="mt-7 hidden space-y-3 border-t border-papel/20 pt-6 text-sm leading-relaxed text-papel/65 sm:block">
            <li>Una cuenta por profesional, con tus datos a mano.</li>
            <li>Los precios de la IA se marcan como estimados.</li>
            <li>Tú decides cuándo se comparte el enlace.</li>
          </ul>
        </div>

        <p className="mt-10 text-xs text-papel/60 lg:mt-0">
          Hecho para autónomos de reformas y reparaciones.
        </p>
      </section>

      <section className="flex items-center px-5 py-10 sm:px-8 lg:px-16 lg:py-14">
        <div className="mx-auto w-full max-w-md">
          {enlaceCaducado ? (
            <p
              role="alert"
              className="mb-6 border-l-4 border-senal bg-senal/10 px-3 py-2.5 text-sm font-medium text-senal"
            >
              Ese enlace ya no vale. Pide otro correo de recuperación o entra
              con tu contraseña.
            </p>
          ) : null}

          <FormularioAcceso siguiente={siguiente} />

          <p className="mt-10 text-xs text-tinta/65">
            <Link href="/" className="underline-offset-4 hover:underline">
              Volver a la página principal
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
