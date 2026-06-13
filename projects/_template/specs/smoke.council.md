# El Consejo — @smoke @unreviewed monorepo smoke — Playwright levanta y navega
> Spec: specs/smoke.spec.md
> Completá cada punto antes de cambiar @unreviewed → @regression.
> Marcá con [x] cuando el veredicto es APROBADO, [ ] si está pendiente.

## 🔴 **Rompedor**
_¿Probaste caminos negativos, bordes, input inválido, doble clic? ¿O solo el happy path?_

- [ ] APROBADO
- Veredicto: _(escribí aquí qué probaste y qué encontraste)_

## 🟠 **Cobertura**
_¿Quedó algún criterio del spec sin aserción?_

- [ ] APROBADO
- Veredicto: _(escribí aquí qué probaste y qué encontraste)_

## 🟡 **Aserciones**
_¿Las aserciones verifican el resultado REAL o solo que "la página cargó"?_

- [ ] APROBADO
- Veredicto: _(escribí aquí qué probaste y qué encontraste)_

## 🔵 **Prueba de fuego**
_¿Rompiste a propósito el resultado esperado y el test se puso ROJO? (OBLIGATORIO)_

- [ ] APROBADO
- Veredicto: _(escribí aquí qué probaste y qué encontraste)_

## ⚪ **Fiabilidad**
_¿Es flaky? ¿Tiene esperas duras? ¿Locators frágiles?_

- [ ] APROBADO
- Veredicto: _(escribí aquí qué probaste y qué encontraste)_

---
> Cuando los 5 puntos estén [x], corré `npm run check-council` y graduá el test.