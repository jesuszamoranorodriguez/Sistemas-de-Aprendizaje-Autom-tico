export function EsqueletoPagina() {
  return (
    <main
      id="contenido"
      aria-busy="true"
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14"
    >
      <span className="sr-only">Cargando…</span>

      <div
        aria-hidden="true"
        className="h-9 w-72 max-w-full animate-pulse bg-tinta/10 sm:h-10"
      />
      <div
        aria-hidden="true"
        className="mt-3 h-4 w-full max-w-xl animate-pulse bg-tinta/10"
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
        <div
          aria-hidden="true"
          className="h-56 animate-pulse border border-tinta/15 bg-white"
        />
        <div
          aria-hidden="true"
          className="h-56 animate-pulse border border-tinta/15 bg-white"
        />
      </div>
    </main>
  );
}
