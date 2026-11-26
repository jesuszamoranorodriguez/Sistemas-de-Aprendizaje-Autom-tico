"use client";

import { useEffect } from "react";

/** Lleva el foco al primer campo marcado como inválido tras validar el formulario. */
export function EnfocarErrores({
  errores,
}: {
  errores?: Record<string, string>;
}) {
  const firma = errores ? Object.keys(errores).sort().join(",") : "";

  useEffect(() => {
    if (!firma) {
      return;
    }

    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [firma]);

  return null;
}
