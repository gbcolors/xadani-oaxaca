# Handoff rapido para operadorc101-xadani

Fecha: 2026-07-03  
Proyecto: Xadani en Oaxaca  
Repo correcto: `C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca`  
GitHub: `https://github.com/gbcolors/xadani-oaxaca`  
Issue de seguimiento: `https://github.com/gbcolors/xadani-oaxaca/issues/1`

## Leer primero

El handoff operativo completo esta aqui:

```text
C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca\docs\handoff-operadorc101-xadani-menu-20260703.md
```

El ticket master esta aqui:

```text
C:\Users\Usuario\Documents\Codex\2026-06-04\vamos-a-desarrollar-una-aplicaci-n-2\docs\tickets\XADANI-MENU-CHANGES-HANDOFF-OPERADORC101-20260703.md
```

## No buscar en todo Documents\Codex

No ejecutar busquedas globales en `C:\Users\Usuario\Documents\Codex` porque arrastran repos historicos, snapshots, node_modules y paquetes temporales.

Usar solo estas busquedas acotadas:

```powershell
rg -n "Garnachas|Ubre|Lisa|Camarones|Tasajo|menu|platillo" "C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca"
git -C "C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca" status --short
```

## Regla actualizada por direccion

Las instrucciones directas de `japhce411` sobre cambios de menu prevalecen sobre cualquier paquete local, demo, seed anterior o criterio provisional del operador. Esos cambios deben aplicarse en la BD real dedicada de Xadani, no quedarse solo en archivos locales.

Antes de escribir en produccion:

1. Confirmar que se esta usando el proyecto independiente `xadani-oaxaca`.
2. Confirmar que la conexion apunta a la BD dedicada de Xadani, no a `gb_master_db` ni a otro cliente.
3. Respaldar o exportar los registros afectados.
4. Ejecutar el cambio con bitacora: fecha, operador, instruccion recibida, campos modificados y resultado.
5. Validar `/menu.html`, `/admin` y `/api/menu` contra la BD real.

No ejecutar seeds destructivos. Si un platillo debe eliminarse del menu publico, se desactiva (`active=false`) salvo instruccion expresa de borrado definitivo.
