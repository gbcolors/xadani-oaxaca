# Como subir el sitio web de Xadani

Este proyecto puede subirse de dos formas:

## Opcion recomendada: Vercel con Stripe

Usa esta opcion si quieres que funcionen los anticipos, experiencias y eventos con Stripe.

1. Crea una cuenta en Vercel.
2. Sube este proyecto a GitHub.
3. En Vercel, elige `Add New Project` e importa el repositorio.
4. En `Settings > Environment Variables`, agrega:

```bash
STRIPE_SECRET_KEY=sk_live_o_sk_test_de_stripe
PUBLIC_SITE_URL=https://xadanienoaxaca.com
```

5. Despliega el proyecto.
6. En `Settings > Domains`, agrega `xadanienoaxaca.com`.
7. En tu proveedor de dominio, apunta el DNS a Vercel siguiendo las instrucciones que Vercel muestre.

Vercel aplica variables de entorno a nuevos deployments, asi que despues de cambiarlas hay que redeployar.

## Opcion simple: hosting estatico

Usa esta opcion si solo quieres mostrar el sitio sin cobros reales.

Sube estos archivos y carpetas a tu hosting:

```text
index.html
styles.css
script.js
assets/
```

En esta opcion el formulario guarda reservas localmente en el navegador, pero Stripe no funcionara porque falta el endpoint seguro `/api/create-checkout-session`.

## Checklist antes de publicar

- Cambiar telefono real en `index.html`.
- Cambiar correo real en `index.html`.
- Verificar precios de menu y experiencias.
- Cambiar `PUBLIC_SITE_URL` al dominio definitivo.
- Activar claves reales de Stripe solo cuando ya este listo para cobrar.
