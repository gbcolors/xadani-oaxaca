# Configurar AWS RDS como base de datos

El sitio de Xadani ya esta preparado para usar una base PostgreSQL en AWS.

## 1. Crear base en AWS

En AWS crea una base:

- Servicio: **Amazon RDS**
- Motor: **PostgreSQL**
- Nombre de base sugerido: `xadani`
- Usuario sugerido: `xadani_admin`
- Puerto: `5432`
- Acceso publico: activado si Vercel se conectara directamente desde internet

Tambien puedes usar el script incluido:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-aws-rds.ps1
```

El script verifica tu identidad AWS, crea una instancia RDS PostgreSQL si no existe y al final imprime el `DATABASE_URL` que debes pegar en Vercel.

## 2. Security group

En el security group de RDS agrega una regla inbound:

```text
Type: PostgreSQL
Port: 5432
Source: 0.0.0.0/0
```

Para produccion es mejor restringir el origen, pero Vercel no siempre tiene IP fija en planes comunes.

## 3. Crear DATABASE_URL

Cuando AWS muestre el endpoint, arma la variable asi:

```text
DATABASE_URL=postgresql://USUARIO:CONTRASENA@ENDPOINT_RDS:5432/NOMBRE_BASE?sslmode=require
```

Ejemplo:

```text
DATABASE_URL=postgresql://xadani_admin:password_seguro@xadani-db.abc123.us-east-1.rds.amazonaws.com:5432/xadani?sslmode=require
```

Si tu contrasena tiene caracteres especiales como `@`, `#`, `%`, `/` o `:`, codificalos antes de pegarla en la URL.

## 4. Variables en Vercel

En Vercel > Project > Settings > Environment Variables agrega:

```text
DATABASE_URL=postgresql://...
ADMIN_API_TOKEN=una-clave-larga-privada
STRIPE_SECRET_KEY=sk_...
PUBLIC_SITE_URL=https://xadanienoaxaca.com
```

Despues haz **Redeploy**.

## 5. Inicializar tablas

Cuando termine el redeploy:

```bash
curl -X POST https://xadanienoaxaca.com/api/db/init
```

Debe responder:

```json
{ "ok": true }
```
