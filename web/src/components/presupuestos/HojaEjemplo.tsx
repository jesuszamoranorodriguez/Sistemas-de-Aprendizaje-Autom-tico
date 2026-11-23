const partidas = [
  {
    concepto: "Sifón flexible 40 mm",
    cantidad: "1 ud",
    importe: "12,40 €",
    estimado: true,
  },
  {
    concepto: "Mano de obra",
    cantidad: "1,5 h",
    importe: "67,50 €",
    estimado: true,
  },
  {
    concepto: "Desplazamiento",
    cantidad: "1",
    importe: "18,00 €",
    estimado: false,
  },
];

export function HojaEjemplo() {
  return (
    <figure
      role="img"
      aria-label="Ejemplo de presupuesto de una fuga en el sifón del lavabo: tres partidas, dos precios marcados como estimados, una partida con confianza baja y un total de 118,46 euros."
      className="relative mx-auto w-full max-w-xl rotate-[-1.2deg] border border-tinta/20 bg-white p-4 shadow-[7px_7px_0_0_var(--color-linea)] sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-tinta/15 pb-3">
        <p className="text-sm font-extrabold tracking-tight sm:text-base">
          Presupuesto 0142
        </p>
        <p className="text-xs text-tinta/70 sm:text-sm">23 nov 2026</p>
      </div>

      <div className="flex items-baseline justify-between gap-3 py-3 text-xs sm:text-sm">
        <p className="text-tinta/70">Para</p>
        <p className="text-right font-medium">C. Maldonado, 12 · 3.º B</p>
      </div>

      <p className="pb-3 text-xs leading-relaxed text-tinta/80 sm:text-sm">
        Fuga en el sifón del lavabo del baño. Grifo monomando con pérdida.
      </p>

      <table className="w-full border-collapse text-left text-[11px] sm:text-sm">
        <thead>
          <tr className="border-y border-tinta/15 text-tinta/70">
            <th scope="col" className="py-1.5 pr-2 font-normal">Concepto</th>
            <th scope="col" className="py-1.5 pr-2 text-right font-normal">
              Cantidad
            </th>
            <th scope="col" className="py-1.5 text-right font-normal">
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          {partidas.map((partida) => (
            <tr key={partida.concepto} className="border-b border-tinta/10">
              <td className="py-2 pr-2 align-top">{partida.concepto}</td>
              <td className="py-2 pr-2 text-right align-top tabular-nums whitespace-nowrap text-tinta/70">
                {partida.cantidad}
              </td>
              <td className="py-2 text-right align-top tabular-nums whitespace-nowrap">
                <span className="block font-medium">{partida.importe}</span>
                {partida.estimado ? (
                  <span className="block text-[10px] text-senal">
                    precio estimado
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 space-y-1 text-xs sm:text-sm">
        <p className="flex justify-between gap-4">
          <span className="text-tinta/70">Base imponible</span>
          <span className="tabular-nums">97,90 €</span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-tinta/70">IVA 21 %</span>
          <span className="tabular-nums">20,56 €</span>
        </p>
        <p className="flex justify-between gap-4 border-t border-tinta/15 pt-2 text-base font-extrabold sm:text-lg">
          <span>Total</span>
          <span className="tabular-nums">118,46 €</span>
        </p>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed font-medium text-senal sm:text-xs">
        Mano de obra con confianza baja: recomendamos visita presencial.
      </p>

      <span className="absolute -bottom-3 right-4 rotate-[-4deg] border-2 border-senal/60 bg-white px-2.5 py-1 text-[9px] font-extrabold tracking-[0.18em] text-senal sm:text-[11px]">
        REVISAR PRECIOS
      </span>
    </figure>
  );
}
