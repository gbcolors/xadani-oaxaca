# Xadani - bitacora de actualizacion de menu en BD real

Fecha: 2026-07-03  
Operador: operadorc101-xadani / Codex  
Coordinacion: operadorc414  
Instruccion: cambios de menu solicitados por direccion (`japhce411`).

## Repo usado

`C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca`

GitHub: `gbcolors/xadani-oaxaca`

## BD usada

- Proveedor: Neon
- Host: `ep-square-union-at1jpm6s-pooler.c-9.us-east-1.aws.neon.tech`
- Base: `neondb`
- Validacion: no coincide con `gb_master_db`.

## Respaldo / evidencia previa

Antes de la escritura se confirmo que la BD dedicada no tenia tablas `menu_items` ni `menu_categories`; solo existian tablas operativas de portafolio y Neon Auth. Por tanto, el respaldo previo equivalente fue la verificacion de ausencia de tablas de menu.

Snapshot posterior:

`docs/backups/xadani-menu-post-sync-2026-07-03T20-51-01-766Z.json`

## Cambios aplicados

- `Garnachas` pasa a `Garnachas istmeñas`.
- `Tasajo al horno (beela doo')` queda fuera del menu fisico validado y se desactiva si existiera.
- `Ubre de vaca al horno` queda activo.
- `Lisa al horno con aderezo` pasa a `Lisa al horno de barro tradicional con aderezo de la casa`.
- `Camarones con aderezo al horno` pasa a `Camarones al horno`.
- Los platillos que no estan en el menu fisico validado quedan con `active=false`, sin borrarse.

## Imagenes usadas

- `assets/gallery/xadani-menu-confirmado/garnachas-istmenas.jpg`
- `assets/gallery/xadani-menu-confirmado/camarones-al-horno.jpg`
- `assets/gallery/xadani-menu-confirmado/lisa-al-horno-barro.jpg`

## Resultado BD

`physical_menu_sync_version = 20260703-menu-confirmado-v1`

Registros post-sync:

- `menu_items`: 67
- `menu_categories`: 15

## Pendiente tecnico

Produccion requiere deploy del repo correcto para:

- leer `xadani_DATABASE_URL`;
- publicar `/api/db-health`;
- servir las imagenes nuevas;
- evitar que `/api/menu` siga usando fallback anterior.
