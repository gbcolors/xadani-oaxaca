# Handoff operadorc101-xadani: cambios solicitados de menu

Fecha: 2026-07-03  
Proyecto: Xadani en Oaxaca  
Repositorio: `gbcolors/xadani-oaxaca`  
Dominio: `https://xadanienoaxaca.com`  
Operador responsable: `operadorc101-xadani`  
Coordinacion: `operadorc414`

## Estado

Este repositorio ya es el proyecto independiente correcto para Xadani. No trabajar cambios de Xadani desde el monorepo master ni desde paquetes temporales sin comparar contra este repo.

## Regla actualizada por direccion

Las instrucciones de cambios al menu dadas por `japhce411` son la fuente de verdad vigente. Si existe conflicto con datos demo, seeds, menu anterior, captura previa o criterio provisional del operador, prevalece la instruccion directa de direccion.

Los cambios aprobados deben aplicarse en la BD real dedicada de Xadani. No basta con preparar un paquete local. La escritura debe hacerse con trazabilidad y sin afectar otros portafolios.

## Solicitud recibida

Hay cambios de menu pendientes solicitados por direccion. El operador debe confirmar origen tecnico y aplicar en BD real dedicada:

1. Confirmar que el menu publico se actualiza desde `/api/menu` conectado a la BD dedicada.
2. Confirmar que `DATABASE_URL`/proveedor apunta al proyecto independiente Xadani, no a Gato Bronco master ni a otro cliente.
3. Desactivar platillos demo/anteriores que direccion indique retirar del menu publico.
4. Nombres definitivos iniciales:
   - Garnachas istmenas.
   - Ubre de vaca al horno.
   - Lisa al horno de barro tradicional con aderezo de la casa.
   - Camarones al horno.
5. Si `Tasajo al horno` debe eliminarse/desactivarse o corregirse a `Ubre de vaca al horno`.
6. Ruta final de imagenes para garnachas, camarones y lisa.

## Aplicacion en BD real

Flujo obligatorio:

1. Exportar respaldo de `menu_items` y `menu_categories` o registrar snapshot equivalente.
2. Aplicar cambios por panel admin/API/transaccion SQL segun corresponda.
3. Usar `active=false` para retirar platillos del menu publico, salvo orden expresa de borrado definitivo.
4. Registrar bitacora con: instruccion, operador, fecha/hora, registros afectados y resultado.
5. Validar que `/api/menu`, `/menu.html` y `/admin` reflejen la BD real.

## No publicar hasta validar

- No hacer deploy sin vista previa o reporte.
- No ejecutar seed destructivo.
- No borrar platillos sin autorizacion expresa.
- No modificar otros portafolios.

## Pruebas obligatorias antes de solicitar publicacion

- `npm run check` si existe script.
- Revisar `/`.
- Revisar `/menu.html`.
- Revisar `/reservas`.
- Revisar `/goreservas`.
- Revisar `/admin`.
- Revisar `/api/db-health`.

## Entrega esperada del operador

Reportar:

- archivos modificados;
- origen de datos;
- BD afectada o no afectada;
- imagenes usadas;
- cambios propuestos;
- riesgos;
- URL de preview si existe;
- confirmacion de BD real actualizada o motivo exacto si no fue posible actualizarla.
