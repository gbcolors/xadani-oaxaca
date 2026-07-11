# Xadani en Oaxaca - Corte rector de portafolio

Fecha: 2026-07-11  
Operador: operadorc101-player / Codex  
Estado: corte rector activo

## Decision

El proyecto vivo de Xadani en Oaxaca queda definido como:

- Proyecto Vercel canonico: `xadani-oaxaca`
- Dominio publico: `https://xadanienoaxaca.com`
- Admin: `https://xadanienoaxaca.com/admin`
- Reservas publicas: `https://xadanienoaxaca.com/reservas.html`
- GoReservas operativo: `https://xadanienoaxaca.com/goreservas`
- Repo local correcto: `C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca`
- BD: independiente del portafolio Xadani, priorizando `XADANI_DATABASE_URL`

## Proyectos historicos a retirar

Estos proyectos/deployments quedan marcados como historicos y no deben recibir nuevas configuraciones productivas:

1. `toma-como-base-https-www-fishers`
   - Deployment referido: `toma-como-base-https-www-fishers-c3cb6bwcr-gato-bronco.vercel.app`
   - Uso correcto: referencia historica de diseno/contenido.
   - Riesgo: arrastra nombre `project-hu322` y puede mezclar decisiones antiguas con Xadani.

2. `deploy-xadani-oaxaca`
   - Deployment referido: `deploy-xadani-oaxaca-jkjfl3ntd-gato-bronco.vercel.app`
   - Uso correcto: paquete temporal de despliegue.
   - Riesgo: si se usa como fuente viva duplica rutas y configuracion.

## Regla operativa

Antes de cualquier cambio en Xadani:

1. Trabajar solo en `C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca`.
2. Confirmar que `.vercel/project.json` diga `"projectName": "xadani-oaxaca"`.
3. Confirmar que la BD no sea `gb_master_db` ni de otro cliente.
4. No ejecutar seeds destructivos.
5. Si hay datos de menu, reservas, galeria o pagos, registrar bitacora antes y despues.

## CRM worker

Se agrega endpoint:

```text
/api/crm-worker
```

Funciones:

- Registra ficha del portafolio Xadani en `portfolio_registry`.
- Registra estado de conectores en `connector_credentials_status`.
- Crea tareas operativas en `crm_worker_tasks`.
- Lee reservas reales desde `reservations`.
- Separa reservas telefonicas de Gala por fuente `gophone:gala` cuando el texto operativo contiene `Conmutador Xadani`.

El worker no mezcla datos de otros portafolios. Su `portfolio_id` es:

```text
portfolio-xadani-oaxaca
```

## Rutas vivas

| Ruta | Funcion |
| --- | --- |
| `/` | Sitio publico Xadani |
| `/reservas.html` | Motor publico de reservas |
| `/goreservas` | Vista operativa de reservas |
| `/admin` | Panel interno del proyecto |
| `/api/db-health` | Salud BD independiente |
| `/api/crm-worker` | Salud CRM worker y ficha del portafolio |
| `/api/twilio-voice?line=xadani` | Entrada del asistente telefonico Gala |

## Nota sobre la caida del sitio

El 2026-07-11 se detecto que la presencia de una carpeta `public/` con solo assets hacia que Vercel publicara esa carpeta como salida estatica, dejando fuera `index.html`, `reservas.html` y `goreservas.html`. Se corrigio moviendo esos assets a `assets/` y redeployando desde el proyecto canonico.

No se modifico la BD por esa correccion.
