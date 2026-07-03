# Handoff operadorc101-xadani: cambios solicitados de menu

Fecha: 2026-07-03  
Proyecto: Xadani en Oaxaca  
Repositorio: `gbcolors/xadani-oaxaca`  
Dominio: `https://xadanienoaxaca.com`  
Operador responsable: `operadorc101-xadani`  
Coordinacion: `operadorc414`

## Estado

Este repositorio ya es el proyecto independiente correcto para Xadani. No trabajar cambios de Xadani desde el monorepo master ni desde paquetes temporales sin comparar contra este repo.

## Solicitud recibida

Hay cambios de menu pendientes solicitados por direccion. Antes de publicar o tocar base de datos remota, confirmar:

1. Si el menu publico se actualiza desde BD remota, API, seed local o panel admin.
2. Como se sincroniza el menu sin afectar otros sitios.
3. Si deben desactivarse platillos demo/anteriores que no esten en el menu fisico validado.
4. Nombres definitivos:
   - Garnachas istmenas.
   - Ubre de vaca al horno.
   - Lisa al horno de barro tradicional con aderezo de la casa.
   - Camarones al horno.
5. Si `Tasajo al horno` debe eliminarse/desactivarse o corregirse a `Ubre de vaca al horno`.
6. Ruta final de imagenes para garnachas, camarones y lisa.

## No publicar hasta validar

- No hacer deploy sin vista previa o reporte.
- No ejecutar seed destructivo.
- No borrar platillos sin autorizacion.
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
- confirmacion de que no se toco produccion.
