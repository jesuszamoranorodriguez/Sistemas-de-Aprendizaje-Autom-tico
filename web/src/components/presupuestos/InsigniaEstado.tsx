import {
  ETIQUETAS_ESTADO,
  type EstadoPresupuesto,
} from "@/lib/presupuestos";

const ESTILOS: Record<EstadoPresupuesto, { caja: string; punto: string }> = {
  borrador: {
    caja: "border-tinta/25 bg-white text-tinta/70",
    punto: "bg-tinta/40",
  },
  generando: {
    caja: "border-plano/30 bg-plano/5 text-plano",
    punto: "bg-plano",
  },
  revisado: {
    caja: "border-plano/40 bg-plano/5 text-plano",
    punto: "bg-plano",
  },
  enviado: {
    caja: "border-plano/40 bg-white text-plano",
    punto: "bg-plano",
  },
  aceptado: {
    caja: "border-confirmado/40 bg-confirmado/10 text-confirmado",
    punto: "bg-confirmado",
  },
  rechazado: {
    caja: "border-senal/40 bg-senal/10 text-senal",
    punto: "bg-senal",
  },
  caducado: {
    caja: "border-tinta/20 bg-tinta/5 text-tinta/55",
    punto: "bg-tinta/30",
  },
  facturado: {
    caja: "border-tinta bg-tinta text-papel",
    punto: "bg-papel",
  },
};

export function InsigniaEstado({ estado }: { estado: EstadoPresupuesto }) {
  const estilo = ESTILOS[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-semibold ${estilo.caja}`}
    >
      <span aria-hidden="true" className={`size-1.5 ${estilo.punto}`} />
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}
