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

## Regla

No publicar, no ejecutar seeds destructivos y no tocar base remota hasta confirmar origen de datos del menu y preparar reporte de cambios.
