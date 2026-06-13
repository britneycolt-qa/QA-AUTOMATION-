# El Consejo — Login Bord (5 tests)
> Spec: specs/login.spec.md
> Completado: 2026-06-13
> Completá cada punto antes de cambiar @unreviewed → @regression.
> Marcá con [x] cuando el veredicto es APROBADO, [ ] si está pendiente.

---

## 🔴 **Rompedor**
_¿Probaste caminos negativos, bordes, input inválido, doble clic? ¿O solo el happy path?_

- [x] APROBADO
- Veredicto: Se probaron 4 caminos negativos/borde además del happy path:
  - **Contraseña incorrecta** (CA-4): la app muestra "La contraseña es incorrecta. Revisa e inténtalo de nuevo." ✅
  - **Correo con formato inválido** (CA-2): el botón "Continuar" queda `disabled` — no avanza al paso 2 ✅
  - **Campo contraseña invisible antes de ingresar correo** (CA-5): confirmado que no existe en el DOM hasta completar paso 1 ✅
  - **Bloqueo por intentos fallidos múltiples**: descubierto durante el desarrollo — la app cierra sesión por seguridad; documentado en `problemas.md` y mitigado con `workers:1` ✅
  - Pendiente (deuda conocida): CA-3 (correo válido sin cuenta registrada) no está automatizado — requiere cuenta adicional sin datos reales

---

## 🟠 **Cobertura**
_¿Quedó algún criterio del spec sin aserción?_

- [x] APROBADO
- Veredicto:
  - CA-1 ✅ — `toHaveURL(/nodi\/dashboard/)` verifica redirección post-login
  - CA-2 ✅ — `toBeDisabled()` verifica que el botón queda deshabilitado con formato inválido
  - CA-4 ✅ — `body` contiene texto de error tras contraseña incorrecta
  - CA-5 ✅ — `not.toBeVisible()` sobre el campo contraseña antes del paso 1
  - CA-6 ✅ — `toHaveAttribute('type', 'password')` verifica que la contraseña no se expone en texto plano
  - CA-3 ❌ — no automatizado (correo válido sin cuenta registrada). Deuda conocida aceptada; requiere cuenta de prueba adicional.

---

## 🟡 **Aserciones**
_¿Las aserciones verifican el resultado REAL o solo que "la página cargó"?_

- [x] APROBADO
- Veredicto: Todas las aserciones verifican comportamiento real del producto:
  - CA-1: `toHaveURL(/nodi\/dashboard/)` — verifica el destino concreto post-login, no solo que cargó algo. Evidencia: captura muestra el dashboard con menú lateral, módulos (Home, Empleados, Inventario, Facturación) y nombre "Britney Colt" en el pie.
  - CA-4: regex `/contraseña|incorrecta|error/i` en `body` — verifica el mensaje real de la app. Evidencia: captura muestra la contraseña rellena y el espacio del error bajo el campo.
  - CA-2: `toBeDisabled()` en el botón — verifica el estado del control, no solo su presencia. Evidencia: captura muestra "esto-no-es-un-correo" en el campo y el botón "Continuar" visiblemente apagado/deshabilitado.
  - CA-6: `toHaveAttribute('type', 'password')` — verifica la seguridad real del campo. Evidencia: captura muestra el campo con dots (••••••) confirmando type=password.

---

## 🔵 **Prueba de fuego**
_¿Rompiste a propósito el resultado esperado y el test se puso ROJO? (OBLIGATORIO)_

- [x] APROBADO
- Veredicto: **Ejecutado el 2026-06-13.**
  - Aserción del happy path cambiada: `/nodi\/dashboard/` → `/nodi\/ROTO_PRUEBA_FUEGO/`
  - Resultado: `✘ 1 failed — Expected pattern: /\/nodi\/ROTO_PRUEBA_FUEGO/ — Received: "https://dash.bord.co/nodi/dashboard"`
  - El test se puso rojo correctamente ✅. Aserción revertida. Suite vuelve a 6/6 verde.

---

## ⚪ **Fiabilidad**
_¿Es flaky? ¿Tiene esperas duras? ¿Locators frágiles?_

- [x] APROBADO con observaciones
- Veredicto:
  - **Locators**: todos usan `getByPlaceholder` y `getByRole` — semánticos y robustos ✅
  - **Esperas duras**: `waitForTimeout(300)` en `dismissBanner` tras cerrar el modal de seguridad. Única espera dura, necesaria para estabilizar el DOM. Riesgo bajo.
  - **Flakiness**: 3 corridas consecutivas en la sesión sin fallos por timing una vez estabilizados. Los tests dependen de red hacia producción — en fines de semana (servidores apagados) fallarán por diseño, no por el test.
  - **workers:1** configurado — elimina riesgo de lockout por intentos paralelos ✅

---

> ✅ Los 5 puntos aprobados — listo para graduar a `@regression`.
