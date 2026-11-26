import type { TextareaHTMLAttributes } from "react";

type Props = {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  id: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function CampoArea({
  etiqueta,
  ayuda,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}: Props) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const descrito = [idAyuda, idError].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-tinta">
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito}
        className={`mt-2 block w-full resize-y border bg-white px-3 py-2.5 text-base text-tinta placeholder:text-tinta/40 focus:border-plano ${
          error ? "border-senal" : "border-tinta/25"
        } ${className}`}
        {...props}
      />
      {ayuda ? (
        <p id={idAyuda} className="mt-1.5 text-xs leading-relaxed text-tinta/60">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={idError} className="mt-1.5 text-sm font-medium text-senal">
          {error}
        </p>
      ) : null}
    </div>
  );
}
