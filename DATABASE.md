# Base de datos

El sitio usa Postgres mediante la variable `DATABASE_URL`. Puede ser una base de datos de Vercel Postgres, Neon, Supabase o Railway.

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

## Seguridad

El panel admin manda `ADMIN_API_TOKEN` en el header `x-admin-token`. Si configuras esta variable en Vercel, entra al panel usando ese mismo token como clave. Para produccion conviene cambiar el login demo por autenticacion real.
