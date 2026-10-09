# Despliegue en Vercel

Guía para publicar el frontend de Enlaza en **Vercel**, incluyendo la configuración de `VITE_API_URL` para producción.

## Requisitos previos

- Repositorio git con el código de `enlaza-frontend` empujado a GitHub (o GitLab/Bitbucket).
- Una cuenta en [vercel.com](https://vercel.com) (se puede conectar con GitHub).
- Un dominio propio para producción (opcional; Vercel asigna `*.vercel.app` por defecto).
- La URL pública de producción de la API `enlaza-backend` ya desplegada (p. ej. `https://api.enlaza.example.com`).

## 1. Configurar variables de entorno

Las variables que usa el build de Vite solo se leen **en tiempo de build** (prefijo `VITE_`). Hay que definirlas en el panel de Vercel para cada entorno.

| Variable | Valor | Requerida |
|---|---|---|
| `VITE_API_URL` | URL base de la API en producción. Se normaliza en el cliente (se recorta la barra final). **No** incluir `/api`. | Sí |
| `VITE_SENTRY_DSN` | DSN público del proyecto en Sentry. Si queda vacía, el cliente no inicializa Sentry. | No |
| `VITE_SENTRY_ENVIRONMENT` | `production`, `staging`, etc. | No |
| `VITE_RELEASE` | Identificador de release (ej. hash del commit o tag). | No |

Ruta en el panel: *Settings → Environment Variables*, luego *Add Environment Variable*.

> **Importante:** al cambiar variables, Vercel dispara un nuevo build. En Vercel *Redeploy* es automático al hacer push a la rama de producción.

### Ejemplo mínimo para producción

```
VITE_API_URL  = https://api.enlaza.example.com
VITE_SENTRY_ENVIRONMENT = production
```

Ajusta la URL según tu API real.

## 2. Importar el proyecto en Vercel

1. En el dashboard de Vercel: **Add New → Project**.
2. Selecciona el repositorio `enlaza-frontend`.
3. Vercel detecta el framework automáticamente (**Vite**). De lo contrario, configura a mano:

   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (por defecto) o `npm ci` si prefieres instalaciones deterministas.
   - **Root Directory**: dejar vacío (el proyecto está en la raíz del repo).

4. En *Environment Variables*, pega las variables de la sección anterior.
5. **Deploy**.

## 3. Rutas y SPA (imprescindible)

La app usa `createBrowserRouter` de React Router, así que **todas** las rutas (`/candidato/dashboard`, `/vacantes/:id`, …) deben caer en `index.html` del `dist`. Vercel lo hace automáticamente para proyectos Vite con su *rewrite* a `/index.html`, pero conviene verificar:

1. *Project → Settings → Functions / Output*.
2. Si hay problemas de 404 en rutas anidadas, añade un archivo **`vercel.json`** en la raíz del repo:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

## 4. Dominio personalizado y HTTPS

1. *Project → Settings → Domains*.
2. Agrega tu dominio (ej. `app.enlaza.example.com`) y sigue las instrucciones de DNS (registro `CNAME`).
3. Vercel emite el certificado SSL automáticamente (Let's Encrypt).
4. **Actualiza `VITE_API_URL`** si la URL pública de la API cambia al ir a producción, y despliega de nuevo.

## 5. Producción vs. preview

- Los **Preview Deployments** (por cada PR) usan variables de *Development* si las configuraste; si no, usan las de producción. Para tener URLs de API distintas por entorno, define `VITE_API_URL` con *Environment* = `Production` y otra con *Environment* = `Preview`/`Development`.

## 6. Verificación post-despliegue

- Cargar `/` y confirmar que no hay errores en la consola.
- Navegar a una ruta protegida (ej. `/candidato/dashboard`) sin sesión → debe redirigir a `/login`, no dar 404.
- Recargar directamente una ruta profunda (ej. `/vacantes/42`) → debe renderizar (no 404).
- Si `VITE_SENTRY_DSN` está definida, disparar un error controlado y confirmar que aparece en Sentry con `environment = production`.
- En DevTools Mobile (320 px) verificar que no hay scroll horizontal.

## 7. Despliegues automáticos

- Los pushes a la rama de producción disparan builds automáticos.
- Opcional: en *Settings → Git* se puede limitar Vercel a desplegar `main` (o la rama que uses) en Producción, y el resto como Preview.

## 8. Rollback

- *Project → Deployments* → menú de los tres puntos en el despliegue anterior → **Redeploy** (o *Promote to Production* en el caso de `*.vercel.app`).

---

## Referencia de scripts locales

```bash
npm install        # instala dependencias
npm run dev        # servidor local (puerto 5173)
npm run build      # typecheck (tsc -b) + build de Vite en dist/
npm run preview    # sirve dist/ localmente (verifica el build producido)
npm run lint       # ESLint
```