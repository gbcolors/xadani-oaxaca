# Handoff Xadani / gopoint Mercado Pago Point

Fecha: 2026-07-04  
Proyecto: Xadani en Oaxaca  
Repo: `C:\Users\Usuario\Documents\Codex\projects\xadani-oaxaca`  
Estado: pendiente de credenciales y terminal propia.

## Alcance

Se prepara la integracion `gopoint` para que Xadani pueda cobrar presencialmente con terminal Mercado Pago Point desde `gopayments+`, sin mezclar operaciones con Gato Bronco master ni con Asador Bacanora.

## Regla de independencia

Xadani debe operar con:

- Base de datos dedicada.
- Cuenta Mercado Pago propia del negocio o del titular autorizado.
- Terminal Point vinculada a esa cuenta.
- Webhooks/bitacora del proyecto.

No usar credenciales ni terminales de Gato Bronco para cobros reales de Xadani. Solo se permite prueba interna si queda marcada como `sandbox` o `auditoria de sistema`.

## Variables esperadas

En Vercel del proyecto o en la capa master mientras se termina marca blanca:

- `MERCADOPAGO_POINT_XADANI_ACCESS_TOKEN`
- `MERCADOPAGO_POINT_XADANI_TERMINAL_ID`
- `MERCADOPAGO_INTEGRATOR_ID=dev_90369f8977af11f19997d6613c0d9962`

## Flujo previsto

1. Abrir/vincular cuenta Mercado Pago de Xadani.
2. Asociar terminal Point al vendedor correcto.
3. Cargar terminal ID y access token en entorno seguro.
4. En `gopayments+`, seleccionar portafolio `xadani-en-oaxaca`.
5. Elegir proveedor `Terminal Point`.
6. Crear orden presencial.
7. Confirmar webhook y registro en bitacora.

## Pendiente para operadorc101-xadani

No publicar cambios de pagos hasta confirmar:

- Cuenta Mercado Pago correcta.
- Terminal ID correcto.
- BD dedicada en uso.
- Ruta productiva autorizada.
- Prueba con importe minimo autorizada por direccion.
