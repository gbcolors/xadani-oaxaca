# Base de datos

El sitio usa Postgres mediante `DATABASE_URL`. Tambien acepta `POSTGRES_URL`, `POSTGRES_PRISMA_URL` o `POSTGRES_URL_NON_POOLING` si Vercel/Neon las inyecta automaticamente.

## Variables necesarias

```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
ADMIN_API_TOKEN=una-clave-larga-para-el-panel
STRIPE_SECRET_KEY=sk_test_o_sk_live
PUBLIC_SITE_URL=https://xadanienoaxaca.com
```

## Inicializar tablas

Despues de desplegar en Vercel, ejecuta una peticion POST:

```bash
curl -X POST https://xadanienoaxaca.com/api/db/init
```

El endpoint crea:

- `reservations`
- `tables`
- `menu_items`
- `app_settings`

Tambien deja datos iniciales de mesas y ajustes del restaurante.

El SQL base tambien queda documentado en `database/schema.sql`.

Si ves `getaddrinfo ENOTFOUND host`, la variable todavia tiene el placeholder `@host`. Reemplazala por el string real que entrega tu proveedor de Postgres.

## Seguridad

El panel admin manda `ADMIN_API_TOKEN` en el header `x-admin-token`. Si configuras esta variable en Vercel, entra al panel usando ese mismo token como clave. Para produccion conviene cambiar el login demo por autenticacion real.
