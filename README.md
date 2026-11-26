# Presupuesta

Web para autónomos de reformas y reparaciones. El profesional hace una foto o
describe la avería, la IA propone un presupuesto con materiales y horas, él
revisa y valida los precios, y el cliente lo acepta desde un enlace.

## Estado

Fase 2 completada: Supabase conectado, acceso con email y contraseña, perfil
fiscal por cuenta y fotos en un bucket privado. Cada profesional gestiona sus
clientes y crea presupuestos manuales con partidas, totales automáticos e IVA
del 21 % o el 10 %. Los presupuestos aceptados o facturados quedan protegidos y
nada se envía al cliente sin revisión previa. La confirmación de email sigue
desactivada durante el desarrollo. Gemini llega en la fase 3 y el envío y la
aceptación por enlace en la fase 4.

## Requisitos

- Node.js 20.9 o superior (probado con 22)
- npm

## Puesta en marcha

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Abre <http://localhost:3000>. Rellena `web/.env.local` con las claves reales;
ese archivo no se versiona.

## Scripts

Todos se ejecutan dentro de `web/`.

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Sirve la compilación de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |

Orden de verificación antes de subir cambios:

```bash
npm run lint && npm run typecheck && npm run build
```

## Variables de entorno

Están documentadas en `web/.env.example`:

| Variable | Ámbito |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Público |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Público |
| `SUPABASE_SECRET_KEY` | Solo servidor |
| `GEMINI_API_KEY` | Solo servidor |
| `GEMINI_MODEL` | Solo servidor |
| `NEXT_PUBLIC_SITE_URL` | Público |

`NEXT_PUBLIC_SITE_URL` debe ser la URL final en producción: se usa para los
enlaces que se comparten con el cliente.

## Despliegue en Vercel

1. Importa el repositorio desde la web de Vercel.
2. En *Root Directory*, elige `web` (la app vive ahí, no en la raíz del repo).
3. Deja el preset *Next.js* y los comandos por defecto.
4. Añade las variables de entorno en *Settings > Environment Variables*.
5. Despliega.

No hace falta `vercel.json`: la detección automática de Next.js es suficiente.

## Documentación

- `AGENTS.md`: contexto del proyecto e instrucciones para agentes.
- `web/AGENTS.md`: lo genera `next dev`; se versiona y no se edita a mano.
