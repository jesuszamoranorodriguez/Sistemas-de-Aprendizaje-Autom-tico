"use client";

import { useFormStatus } from "react-dom";

import { Boton, type VarianteBoton } from "@/components/ui/Boton";

type Props = {
  children: React.ReactNode;
  pendienteTexto: string;
  variante?: VarianteBoton;
  className?: string;
};

export function BotonEnvio({
  children,
  pendienteTexto,
  variante = "primario",
  className,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Boton
      type="submit"
      variante={variante}
      className={className}
      disabled={pending}
    >
      {pending ? pendienteTexto : children}
    </Boton>
  );
}
