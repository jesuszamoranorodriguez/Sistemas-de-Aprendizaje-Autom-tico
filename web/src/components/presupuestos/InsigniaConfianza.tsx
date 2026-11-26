import type { NivelConfianza } from "@/lib/presupuestos";

const ESTILOS: Record<NivelConfianza, string> = {
  alto: "border-confirmado/40 bg-confirmado/10 text-confirmado",
  medio: "border-plano/40 bg-plano/5 text-plano",
  bajo: "border-senal/50 bg-senal/10 text-senal",
};

const ETIQUETAS: Record<NivelConfianza, string> = {
  alto: "Confianza alta",
  medio: "Confianza media",
  bajo: "Confianza baja",
};

export function InsigniaConfianza({
  confianza,
}: {
  confianza: NivelConfianza | null;
}) {
  if (!confianza) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center border px-1.5 py-0.5 text-xs font-semibold ${ESTILOS[confianza]}`}
    >
      {ETIQUETAS[confianza]}
    </span>
  );
}
