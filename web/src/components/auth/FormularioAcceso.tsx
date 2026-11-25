"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  entrar,
  registrarse,
  type EstadoAuth,
} from "@/actions/auth";
import { Campo } from "@/components/ui/Campo";

const ESTADO_INICIAL: EstadoAuth = {};

type Props = {
  siguiente?: string;
};

export function FormularioAcceso({ siguiente }: Props) {
  const [modo, setModo] = useState<"entrar" | "alta">("entrar");
  const [estadoEntrar, accionEntrar, pendienteEntrar] = useActionState(
    entrar,
    ESTADO_INICIAL,
  );
  const [estadoAlta, accionAlta, pendienteAlta] = useActionState(
    registrarse,
    ESTADO_INICIAL,
  );

  const esAlta = modo === "alta";
  const estado = esAlta ? estadoAlta : estadoEntrar;
  const pendiente = esAlta ? pendienteAlta : pendienteEntrar;

  return (
    <div>
      <div
        role="group"
        aria-label="Elige entrar o crear una cuenta"
        className="grid grid-cols-2 border border-tinta/25"
      >
        <button
          type="button"
          onClick={() => setModo("entrar")}
          aria-pressed={!esAlta}
          className={`px-3 py-3 text-sm font-semibold transition-colors ${
            !esAlta
              ? "bg-tinta text-papel"
              : "bg-transparent text-tinta/70 hover:bg-tinta/5"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setModo("alta")}
          aria-pressed={esAlta}
          className={`border-l border-tinta/25 px-3 py-3 text-sm font-semibold transition-colors ${
            esAlta
              ? "bg-tinta text-papel"
              : "bg-transparent text-tinta/70 hover:bg-tinta/5"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <h1 className="mt-9 text-balance text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
        {esAlta ? "Crea tu cuenta de profesional." : "Entra en tu cuenta."}
      </h1>
      <p className="mt-3 max-w-sm leading-relaxed text-tinta/75">
        {esAlta
          ? "Solo necesitas un correo y una contraseña. Los datos fiscales los pides justo después."
          : "Tus presupuestos, tus clientes y tus facturas, en un solo sitio."}
      </p>

      {esAlta ? (
        <form action={accionAlta} className="mt-8 space-y-5" noValidate>
          <Campo
            id="alta-email"
            name="email"
            type="email"
            etiqueta="Correo electrónico"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="tu@correo.es"
            required
          />
          <Campo
            id="alta-contrasena"
            name="contrasena"
            type="password"
            etiqueta="Contraseña"
            ayuda="Mínimo 8 caracteres."
            autoComplete="new-password"
            minLength={8}
            required
          />

          <MensajeEstado estado={estado} />

          <button
            type="submit"
            disabled={pendiente}
            className="w-full bg-tinta px-5 py-3 text-sm font-semibold text-papel transition-colors hover:bg-plano disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendiente ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      ) : (
        <form action={accionEntrar} className="mt-8 space-y-5" noValidate>
          <input
            type="hidden"
            name="siguiente"
            value={siguiente && siguiente.startsWith("/") ? siguiente : "/panel"}
          />
          <Campo
            id="entrar-email"
            name="email"
            type="email"
            etiqueta="Correo electrónico"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="tu@correo.es"
            required
          />
          <Campo
            id="entrar-contrasena"
            name="contrasena"
            type="password"
            etiqueta="Contraseña"
            autoComplete="current-password"
            required
          />

          <MensajeEstado estado={estado} />

          <button
            type="submit"
            disabled={pendiente}
            className="w-full bg-tinta px-5 py-3 text-sm font-semibold text-papel transition-colors hover:bg-plano disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendiente ? "Entrando…" : "Entrar"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm">
        <Link
          href="/recuperar"
          className="font-medium text-plano underline-offset-4 hover:underline"
        >
          He olvidado mi contraseña
        </Link>
      </p>

      {esAlta ? (
        <p className="mt-8 text-xs leading-relaxed text-tinta/60">
          Al crear la cuenta, Presupuesta guarda tus datos para preparar
          presupuestos y facturas. Puedes descargarlos o pedir su borrado cuando
          quieras.
        </p>
      ) : null}
    </div>
  );
}

function MensajeEstado({ estado }: { estado: EstadoAuth }) {
  if (estado.error) {
    return (
      <p
        role="alert"
        className="border-l-4 border-senal bg-senal/10 px-3 py-2.5 text-sm font-medium text-senal"
      >
        {estado.error}
      </p>
    );
  }

  if (estado.aviso) {
    return (
      <p
        role="status"
        className="border-l-4 border-confirmado bg-confirmado/10 px-3 py-2.5 text-sm font-medium text-confirmado"
      >
        {estado.aviso}
      </p>
    );
  }

  return null;
}
