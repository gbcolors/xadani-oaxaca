# Stripe para reservas Xadani

Este sitio ya incluye el flujo visual para reservas sin cargo, anticipos, experiencias y eventos.

## Como funciona

1. El cliente completa la ventana de reserva.
2. Si elige `Reserva sin cargo`, el sitio guarda la solicitud en `localStorage`.
3. Si elige anticipo, experiencia o evento, el navegador llama a `/api/create-checkout-session`.
4. El endpoint crea una sesion de Stripe Checkout con `STRIPE_SECRET_KEY`.
5. Stripe cobra en su pagina segura y regresa al sitio con `?stripe=success`.

## Configuracion

1. Crea una cuenta en Stripe.
2. Copia `.env.example` a `.env.local`.
3. Define:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PUBLIC_SITE_URL=https://xadanienoaxaca.com
```

4. Instala dependencias:

```bash
npm install
```

5. Despliega en Vercel o en un hosting que soporte funciones serverless Node.js.

## Importante

La clave secreta de Stripe nunca debe estar en `index.html` ni en `script.js`. Solo debe vivir en variables de entorno del servidor.
