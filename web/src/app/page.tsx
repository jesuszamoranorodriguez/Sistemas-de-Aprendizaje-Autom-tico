import Link from "next/link";
import { HojaEjemplo } from "@/components/presupuestos/HojaEjemplo";

const pasos = [
  {
    titulo: "Haces la foto",
    texto:
      "O describes la avería con tus palabras. Una fuga, un cuadro eléctrico, un tabique que hay que rehacer.",
  },
  {
    titulo: "Revisas el presupuesto",
    texto:
      "La IA propone materiales y horas. Tú confirmas cada precio y decides si hace falta verlo en persona.",
  },
  {
    titulo: "Lo envías",
    texto:
      "Un enlace por WhatsApp. El cliente lo acepta desde el móvil y el presupuesto pasa a factura.",
  },
];

const reglas = [
  {
    titulo: "Nada sale sin tu visto bueno",
    texto:
      "El presupuesto se queda en borrador hasta que lo validas. El cliente no ve nada antes.",
  },
  {
    titulo: "Los precios de la IA son estimados",
    texto:
      "Cada partida generada lleva su nivel de confianza y se marca como estimada hasta que la confirmas.",
  },
  {
    titulo: "El IVA lo eliges tú",
    texto:
      "El 10 % nunca se aplica solo. Si lo seleccionas, te recordamos que solo vale para obras en vivienda que cumplan los requisitos.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:bg-tinta focus:px-4 focus:py-2 focus:text-papel"
      >
        Saltar al contenido
      </a>

      <header className="mx-auto flex max-w-6xl items-baseline justify-between px-5 py-5 sm:px-8">
        <p className="text-xl font-extrabold tracking-tight">Presupuesta</p>
        <Link
          href="/entrar"
          className="text-sm font-medium text-plano underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </header>

      <main id="contenido">
        <section className="fondo-plano mx-auto grid max-w-6xl gap-12 px-5 pt-8 pb-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:pt-16 lg:pb-28">
          <div>
            <h1 className="text-balance text-4xl leading-[1.02] font-extrabold tracking-[-0.02em] sm:text-5xl lg:max-w-[13ch] lg:text-6xl">
              Haz el presupuesto desde la obra.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-tinta/80">
              Haces una foto. La IA propone materiales y horas. Tú revisas los
              precios, lo envías por WhatsApp y el cliente lo acepta desde el
              móvil.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/entrar"
                className="bg-tinta px-5 py-3 text-sm font-semibold text-papel transition-colors hover:bg-plano"
              >
                Crear mi cuenta
              </Link>
              <a
                href="#como-funciona"
                className="text-sm font-medium text-plano underline-offset-4 hover:underline"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          <HojaEjemplo />
        </section>

        <section
          id="como-funciona"
          className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20"
        >
          <h2 className="max-w-[24ch] text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
            Tres pasos, y el cliente decide.
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {pasos.map((paso, indice) => (
              <li
                key={paso.titulo}
                className="border-t border-tinta/20 pt-4"
              >
                <span
                  className="block text-2xl font-extrabold tabular-nums text-plano/60"
                  aria-hidden="true"
                >
                  {indice + 1}
                </span>
                <h3 className="mt-2 text-base font-bold">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta/75">
                  {paso.texto}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-tinta/15">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
            <h2 className="max-w-[26ch] text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
              Las reglas están en el producto, no en un folleto.
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              {reglas.map((regla) => (
                <li key={regla.titulo}>
                  <h3 className="text-base font-bold">{regla.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-tinta/75">
                    {regla.texto}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-tinta/70 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
        <p className="font-semibold text-tinta">Presupuesta</p>
        <p>Hecho para autónomos de reformas y reparaciones.</p>
      </footer>
    </div>
  );
}
