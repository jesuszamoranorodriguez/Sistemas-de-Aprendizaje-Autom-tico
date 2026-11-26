import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type VarianteBoton =
  | "primario"
  | "secundario"
  | "peligro"
  | "sutil"
  | "sutilPeligro";

const BASE =
  "inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES: Record<VarianteBoton, string> = {
  primario: "bg-tinta px-4 py-2.5 text-papel hover:bg-plano",
  secundario:
    "border border-tinta/30 bg-white px-4 py-2.5 text-tinta hover:border-tinta",
  peligro:
    "border border-senal/40 bg-white px-4 py-2.5 text-senal hover:bg-senal/10",
  sutil: "text-plano underline-offset-4 hover:underline",
  sutilPeligro: "text-senal underline-offset-4 hover:underline",
};

export function clasesBoton(
  variante: VarianteBoton = "primario",
  className = "",
): string {
  return `${BASE} ${VARIANTES[variante]} ${className}`;
}

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
};

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: BotonProps) {
  return <button className={clasesBoton(variante, className)} {...props} />;
}

type EnlaceProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variante?: VarianteBoton;
  children: ReactNode;
};

export function EnlaceBoton({
  href,
  variante = "primario",
  className = "",
  children,
  ...props
}: EnlaceProps) {
  return (
    <Link href={href} className={clasesBoton(variante, className)} {...props}>
      {children}
    </Link>
  );
}
