"use client";

import { useCallback, useId, useRef, useState } from "react";

import {
  FormularioCliente,
  type ClienteFormulario,
} from "@/components/clientes/FormularioCliente";
import { Boton, type VarianteBoton } from "@/components/ui/Boton";

type Props = {
  cliente?: ClienteFormulario;
  etiqueta?: string;
  variante?: VarianteBoton;
};

export function DialogoCliente({
  cliente,
  etiqueta = cliente ? "Editar" : "Nuevo cliente",
  variante = cliente ? "sutil" : "primario",
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [sesion, setSesion] = useState(0);
  const idTitulo = useId();

  const cerrar = useCallback(() => {
    dialogo.current?.close();
  }, []);

  const abrir = () => {
    setSesion((actual) => actual + 1);
    dialogo.current?.showModal();
  };

  return (
    <>
      <Boton type="button" variante={variante} onClick={abrir}>
        {etiqueta}
      </Boton>

      <dialog
        ref={dialogo}
        aria-labelledby={idTitulo}
        onClick={(evento) => {
          if (evento.target === dialogo.current) {
            cerrar();
          }
        }}
        className="dialogo m-auto max-h-[90dvh] w-[min(94vw,36rem)] overflow-y-auto overscroll-contain border border-tinta/25 bg-papel p-0 text-tinta shadow-[8px_8px_0_0_var(--color-linea)]"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id={idTitulo}
                className="text-xl font-extrabold tracking-tight"
              >
                {cliente ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-tinta/60">
                {cliente
                  ? "Los cambios se aplican a los presupuestos que crees a partir de ahora."
                  : "Guárdalo una vez y lo tendrás a mano en los próximos presupuestos."}
              </p>
            </div>
            <button
              type="button"
              onClick={cerrar}
              className="shrink-0 py-1 text-sm font-medium text-plano underline-offset-4 hover:underline"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-6">
            <FormularioCliente
              key={sesion}
              cliente={cliente}
              onExito={cerrar}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
