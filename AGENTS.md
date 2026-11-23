# AGENTS.md

## Alcance
- La raíz de este proyecto es **este directorio** (`Presupuesta-Opencode/`). Todo el trabajo ocurre aquí dentro.
- La carpeta padre y `probarApi/` pertenecen a otra práctica: **no trabajes fuera de `Presupuesta-Opencode/`** ni los modifiques.

## Proyecto
**Presupuesta**: web para autónomos de reformas y reparaciones (fontaneros, electricistas, albañiles).

Flujo: el profesional sube una foto o describe la avería → Gemini (con visión) propone un presupuesto con materiales, horas de mano de obra y costes → el profesional lo revisa y valida → se envía al cliente por un enlace → el cliente lo acepta → el presupuesto aceptado se convierte en factura.

## Stack
- **Next.js (App Router) + TypeScript + Tailwind**, en `web/` (dentro de este repo). Ya creado.
- **Supabase**: base de datos, autenticación y almacenamiento de las fotos.
- **Gemini solo desde el servidor** (Route Handlers / Server Actions). Nunca llamarlo desde el cliente ni exponer la clave.
- Despliegue en **Vercel**.

## Reglas no negociables
- **Español de España** en toda la interfaz y todos los textos.
- **Humano en el bucle**: nada se envía al cliente sin la validación previa del profesional.
- Cada partida generada por la IA lleva un **nivel de confianza** (alto / medio / bajo). Las de nivel bajo deben recomendar visita presencial.
- **Nunca** escribas API keys en el código: variables de entorno en `web/.env.local`.

## Skills y MCP obligatorios
- `frontend-design` → cualquier interfaz.
- `nex-einvoice-es` → cualquier lógica de facturas.
- `web-design-guidelines` → revisar la interfaz al terminar cada pantalla.
- MCP de **Supabase** → crear y modificar tablas.
- MCP de **Chrome DevTools** → comprobar visualmente cada pantalla en tamaño móvil.

## Estado real del repo (verificado)
- Repo git local **sin remoto** (`origin` no existe): `git push` falla hasta que se cree.
- `web/` existe: Next.js **16.4.6**, React 19, Tailwind 4, App Router con `src/`. Fase 0 hecha (portada y `/entrar` provisional); Supabase y Gemini aún no están conectados.
- `web/AGENTS.md` lo regenera `next dev` en cada arranque: se versiona y no se edita a mano.
- Config de OpenCode en `opencode.json` (raíz del repo): plugins `@plannotator/opencode` y `envsitter-guard`; MCP `supabase` (remoto, `project_ref=hzdvmjvnruilepdpajvg`) y `chrome-devtools` (local, vía `npx`).
- `.agents/skills/` está vendorizado y fijado por `skills-lock.json` (fuente + commit + hash). No editar a mano; se regenera desde el lock.
- `.gitignore` raíz ignora `.env`, `.env.local` y `.env.*.local`; `web/.gitignore` exceptúa `.env.example` para que la plantilla se versione.

## Comandos (dentro de `web/`)
- `npm run dev` — servidor de desarrollo.
- `npm run build` — compilación de producción.
- `npm start` — sirve la compilación.
- `npm run lint` — ESLint.
- `npm run typecheck` — `tsc --noEmit`.
- Antes de cada commit: `npm run lint && npm run typecheck && npm run build`.

## Despliegue
- Vercel: **Root Directory = `web`** (la app no está en la raíz del repo). Preset Next.js y comandos por defecto.
- No hay `vercel.json`: la detección automática basta.
- `NEXT_PUBLIC_SITE_URL` debe apuntar a la URL de producción.

## Secretos — EnvSitter Guard
- Los comandos de shell que referencian archivos `.env*` (incluido `.env.local`) están **bloqueados** por el plugin `envsitter-guard` (comprobado). No insistas ni busques rodeos.
- Nunca imprimas valores de secretos. Usa las herramientas `envsitter_*` o la CLI `envsitter`, que solo exponen metadatos (`envsitter_keys`, `envsitter_match`, `envsitter_fingerprint`, `envsitter_validate`, `envsitter_scan`).
- `web/.env.local` es el archivo que lee Next.js; **el `.env` de la raíz no lo lee**. Ambos están gitignoreados; la plantilla sin valores es `web/.env.example`.

## Supabase
- Proyecto vacío a fecha de este archivo: 0 tablas, 0 vistas y 0 funciones en `public`; 0 migraciones. Solo existen esquemas del sistema (`auth`, `storage`, `realtime`, `vault`, `extensions`), así que el esquema se diseña desde cero.
- Cambios de esquema (crear o modificar tablas, RLS, buckets) → MCP de Supabase con `apply_migration` y un **nombre descriptivo** (p. ej. `add_presupuestos_partidas`).
- `execute_sql` **solo para consultas**; nunca para DDL.
- Nada de `psql` ni conexión directa a la base de datos.
