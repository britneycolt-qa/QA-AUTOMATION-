# Problemas y hallazgos — Bord

> Archivo append-only: nunca se borra una entrada, solo se agrega.

| Fecha | Módulo | Descripción | Estado | Notas |
|---|---|---|---|---|
| 2026-06-13 | Login | Credencial QA_PASS incorrecta — la app rechaza la contraseña configurada en .env | ⚠️ Bloqueante | Confirmar contraseña correcta con el usuario |
| 2026-06-13 | Login | Múltiples intentos fallidos en paralelo activan cierre de sesión por seguridad ("Por seguridad, hemos cerrado tu sesión.") | 📋 Particularidad | Los tests de login deben correr en serie (`workers: 1`) para evitar lockout |
| 2026-06-13 | Login | Credencial QA_PASS corregida a `SoportE_2020?` — era `Soporte_2020?` (S minúscula vs E mayúscula) | ✅ Resuelto | |
| 2026-06-13 | Login | La app deshabilita el botón "Continuar" cuando el correo tiene formato inválido (no muestra un mensaje de error explícito) | 📋 Comportamiento observado | Diferente a lo asumido en CA-2 del spec — spec actualizado para reflejar el comportamiento real |
