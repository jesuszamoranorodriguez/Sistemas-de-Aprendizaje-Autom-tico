"use client";

import { useActionState } from "react";

import {
  cambiarContrasena,
  solicitarRecuperacion,
  type EstadoAuth,
} from "@/actions/auth";
import { Campo } from "@/components/ui/Campo";

const ESTADO_INICIAL: EstadoAuth = {};

export function FormularioRecuperar() {
  const [estado, accion, pendiente] = useActionState(
    solicitarRecuperacion,
    ESTADO_INICIAL,
  );

  return (
    <form action={accion} className="mt-8 space-y-5" noValidate>
      <Campo
        id="recuperar-email"
        name="email"
        type="email"
        etiqueta="Correo de tu cuenta"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        placeholder="tu@correo.es"
        required
      />

      <MensajeEstado estado={estado} />

      <button
        type="submit"
        disabled={pendiente}
        className="w-full bg-tinta px-5 py-3 text-sm font-semibold text-papel transition-colors hover:bg-plano disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}

export function FormularioNuevaContrasena() {
  const [estado, accion, pendiente] = useActionState(
    cambiarContrasena,
    ESTADO_INICIAL,
  );

  return (
    <form action={accion} className="mt-8 space-y-5" noValidate>
      <Campo
        id="nueva-contrasena"
        name="contrasena"
        type="password"
        etiqueta="Nueva contraseña"
        ayuda="Mínimo 8 caracteres."
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Campo
        id="nueva-contrasena-repetida"
        name="contrasena2"
        type="password"
        etiqueta="Repite la nueva contraseña"
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
        {pendiente ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
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
