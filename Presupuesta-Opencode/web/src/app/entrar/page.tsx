import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Entrar — Presupuesta",
};

export default function Entrar() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <p className="text-xl font-extrabold tracking-tight">Presupuesta</p>
      <h1 className="mt-10 text-balance text-3xl font-extrabold tracking-tight">
        El alta de profesionales aún no está abierta.
      </h1>
      <p className="mt-4 leading-relaxed text-tinta/80">
        Estamos terminando el acceso. Mientras tanto, en la página principal
        tienes el recorrido completo: foto, revisión y envío al cliente.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-plano underline-offset-4 hover:underline"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
