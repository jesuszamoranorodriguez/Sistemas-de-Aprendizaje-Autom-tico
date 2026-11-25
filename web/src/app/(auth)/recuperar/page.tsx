import type { Metadata } from "next";
import Link from "next/link";

import {
  FormularioNuevaContrasena,
  FormularioRecuperar,
} from "@/components/auth/FormularioRecuperar";
import { obtenerSesion } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "Recuperar acceso — Presupuesta",
};

export default async function Recuperar() {
  const sesion = await obtenerSesion();
  const conSesion = Boolean(sesion);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-14">
      <Link href="/" className="text-xl font-extrabold tracking-tight">
        Presupuesta
      </Link>

      <div className="mt-10 border border-tinta/20 bg-white p-6 shadow-[6px_6px_0_0_var(--color-linea)] sm:p-8">
        <h1 className="text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          {conSesion
            ? "Elige una contraseña nueva."
            : "Recupera el acceso a tu cuenta."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-tinta/75">
          {conSesion
            ? "El enlace es de un solo uso. En cuanto guardes la contraseña, entrarás directamente en tu panel."
            : "Escribe el correo con el que te diste de alta. Te enviaremos un enlace para poner una contraseña nueva."}
        </p>

        {conSesion ? <FormularioNuevaContrasena /> : <FormularioRecuperar />}
      </div>

      <p className="mt-8 text-sm">
        <Link
          href="/entrar"
          className="font-medium text-plano underline-offset-4 hover:underline"
        >
          Volver a entrar
        </Link>
      </p>
    </main>
  );
}
