import type { ReactNode } from "react";

const TONOS = {
  exito: "border-confirmado bg-confirmado/10 text-confirmado",
  error: "border-senal bg-senal/10 text-senal",
  aviso: "border-senal bg-senal/10 text-senal",
  info: "border-plano bg-plano/5 text-plano",
};

type Props = {
  tono?: keyof typeof TONOS;
  children: ReactNode;
  className?: string;
};

export function Aviso({ tono = "info", children, className = "" }: Props) {
  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className={`border-l-4 px-3 py-2.5 text-sm leading-relaxed ${TONOS[tono]} ${className}`}
    >
      {children}
    </div>
  );
}
