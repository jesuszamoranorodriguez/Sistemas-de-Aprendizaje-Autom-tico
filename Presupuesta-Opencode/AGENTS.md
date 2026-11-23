# AGENTS.md

## Alcance
- La raíz de este proyecto es **este directorio** (`Presupuesta-Opencode/`). Todo el trabajo ocurre aquí dentro.
- La carpeta padre y `probarApi/` pertenecen a otra práctica: **no trabajes fuera de `Presupuesta-Opencode/`** ni los modifiques.

## Proyecto
**Presupuesta**: web para autónomos de reformas y reparaciones (fontaneros, electricistas, albañiles).

Flujo: el profesional sube una foto o describe la avería → Gemini (con visión) propone un presupuesto con materiales, horas de mano de obra y costes → el profesional lo revisa y valida → se envía al cliente por un enlace → el cliente lo acepta → el presupuesto aceptado se convierte en factura.

## Stack objetivo
- **Next.js (App Router) + TypeScript + Tailwind**, en `web/` (dentro de este repo).
- **Supabase**: base de datos, autenticación y almacenamiento de las fotos.
- **Gemini solo desde el servidor** (Route Handlers / Server Actions). Nunca llamarlo desde el cliente ni exponer la clave.
- Despliegue en **Vercel**.

## Reglas no negociables
- **Español de España** en toda la interfaz y todos los textos.
- **Humano en el bucle**: nada se envía al cliente sin la validación previa del profesional.
- Cada partida generada por la IA lleva un **nivel de confianza** (alto / medio / bajo). Las de nivel bajo deben recomendar visita presencial.
- **Nunca** escribas API keys en el código: variables de entorno en `.env.local`.

## Skills y MCP obligatorios
- `frontend-design` → cualquier interfaz.
- `nex-einvoice-es` → cualquier lógica de facturas.
- `web-design-guidelines` → revisar la interfaz al terminar cada pantalla.
- MCP de **Supabase** → crear y modificar tablas.
- MCP de **Chrome DevTools** → comprobar visualmente cada pantalla en tamaño móvil.

## Estado real del repo (verificado)
- Repo git **sin commits y sin remoto** (rama `master` sin estrenar): el primer commit será el inicial y no hay `origin` al que hacer push.
- `web/` **aún no existe**: no hay aplicación ni `package.json`. **No inventes comandos**: al crear `web/`, documenta aquí los scripts reales de `web/package.json`.
- `.gitignore` solo ignora `.env` y `node_modules`: **no ignora `.env.local`**. Añádelo al `.gitignore` antes de crear ese archivo o acabará versionado.
- Config de OpenCode en `opencode.json` (raíz del repo): plugins `@plannotator/opencode` y `envsitter-guard`; MCP `supabase` (remoto, `project_ref=hzdvmjvnruilepdpajvg`) y `chrome-devtools` (local, vía `npx`).
- `.agents/skills/` está vendorizado y fijado por `skills-lock.json` (fuente + commit + hash). No editar a mano; se regenera desde el lock.

## Secretos — EnvSitter Guard
- Los comandos de shell que referencian archivos `.env*` (incluido `.env.local`) están **bloqueados** por el plugin `envsitter-guard` (comprobado). No insistas ni busques rodeos.
- Nunca imprimas valores de secretos. Usa las herramientas `envsitter_*` o la CLI `envsitter`, que solo exponen metadatos (`envsitter_keys`, `envsitter_match`, `envsitter_fingerprint`, `envsitter_validate`, `envsitter_scan`).
- `.env` en la raíz contiene `GEMINI_API_KEY` y está gitignoreado. La app lee secretos del entorno, nunca del repo.

## Supabase
- Proyecto vacío a fecha de este archivo: 0 tablas, 0 vistas y 0 funciones en `public`; 0 migraciones. Solo existen esquemas del sistema (`auth`, `storage`, `realtime`, `vault`, `extensions`), así que el esquema se diseña desde cero.
- Cambios de esquema (crear o modificar tablas, RLS, buckets) → MCP de Supabase con `apply_migration` y un **nombre descriptivo** (p. ej. `add_presupuestos_partidas`).
- `execute_sql` **solo para consultas**; nunca para DDL.
- Nada de `psql` ni conexión directa a la base de datos.
