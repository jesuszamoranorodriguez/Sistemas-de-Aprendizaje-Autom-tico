"use client";

import { useFormStatus } from "react-dom";

import { Boton, type VarianteBoton } from "@/components/ui/Boton";

type Props = {
  mensaje: string;
  children: React.ReactNode;
  pendienteTexto?: string;
  variante?: VarianteBoton;
  className?: string;
};

export function BotonConfirmar({
  mensaje,
  children,
  pendienteTexto = "Quitando…",
  variante = "peligro",
  className,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Boton
      type="submit"
      variante={variante}
      className={className}
      disabled={pending}
      onClick={(evento) => {
        if (!window.confirm(mensaje)) {
          evento.preventDefault();
        }
      }}
    >
      {pending ? pendienteTexto : children}
    </Boton>
  );
}
