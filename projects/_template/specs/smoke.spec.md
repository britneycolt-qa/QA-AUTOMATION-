# Spec: smoke — Playwright operativo

## Objetivo
Verificar que el monorepo, las dependencias y el navegador están correctamente instalados y pueden ejecutar una prueba real.

## Criterios de aceptación
1. Playwright puede lanzar Chromium sin errores
2. El navegador puede navegar a una URL externa (example.com)
3. El contenido de la página es verificable con un locator semántico (`getByRole`)
4. El reporte monocart se genera sin errores

## Casos
| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Navegar a https://example.com | Página carga y el heading "Example Domain" es visible |

## Notas
- Esta prueba NO verifica ninguna app de cliente — es infraestructura
- Debe pasar en cualquier máquina que tenga el repo clonado e instalado
- Tag `@smoke` porque es el primer punto de falla: si esto cae, nada más sirve
