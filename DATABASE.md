# Base de datos

El sitio usa Postgres mediante `DATABASE_URL`. Puede ser Neon, Vercel Postgres, Amazon RDS PostgreSQL, Aurora PostgreSQL, Supabase o Railway. Tambien acepta `POSTGRES_URL`, `POSTGRES_PRISMA_URL` o `POSTGRES_URL_NON_POOLING` si Vercel/Neon las inyecta automaticamente.

## Variables necesarias

```bash
DATABASE_URL=postgresql://user:password@ep-example.us-east-1.aws.neon.tech/xadani?sslmode=require
ADMIN_API_TOKEN=una-clave-larga-para-el-panel
STRIPE_SECRET_KEY=sk_test_o_sk_live
PUBLIC_SITE_URL=https://xadanienoaxaca.com
```

## AWS RDS

Para AWS, usa una base **Amazon RDS PostgreSQL** o **Aurora PostgreSQL compatible con Postgres**.

El formato correcto para Vercel es:

```bash
DATABASE_URL=postgresql://USUARIO:CONTRASENA@HOST_NEON/NOMBRE_BASE?sslmode=require
```

Ejemplo:

```bash
DATABASE_URL=postgresql://xadani_owner:password_seguro@ep-example.us-east-1.aws.neon.tech/xadani?sslmode=require
```

Notas importantes:

- El endpoint debe terminar en `.rds.amazonaws.com` o el dominio real de Aurora.
- El security group de RDS debe permitir conexiones entrantes al puerto `5432`.
- Si Vercel se conecta desde internet, RDS debe ser publicamente accesible o debe existir una red/proxy que permita la conexion.
- Si la contrasena tiene caracteres como `@`, `#`, `%`, `/` o `:`, deben ir codificados en URL.

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
