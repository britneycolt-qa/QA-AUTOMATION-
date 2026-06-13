# Spec: login — Autenticación de usuario

## Flujo observado
Dos pasos:
1. El usuario ingresa su correo y hace clic en "Continuar"
2. Aparece el campo contraseña y hace clic en "Iniciar sesión"
3. Si las credenciales son correctas, redirige al dashboard (`/nodi/dashboard`)

## Criterios de aceptación

| # | Criterio | Tipo |
|---|---|---|
| CA-1 | Login exitoso con credenciales válidas redirige al dashboard | happy path |
| CA-2 | Correo inválido (formato incorrecto) deshabilita el botón "Continuar" — no avanza al paso 2 | negativo |
| CA-3 | Correo válido pero sin cuenta registrada muestra error en paso 1 | negativo |
| CA-4 | Contraseña incorrecta muestra error en paso 2 | negativo |
| CA-5 | El campo contraseña no es visible hasta ingresar el correo y hacer clic en "Continuar" | flujo |
| CA-6 | El campo contraseña tiene type="password" (no expone la contraseña en texto plano) | seguridad |

## Casos fuera de scope
- Recuperación de contraseña (link "¿Olvidaste tu contraseña?")
- Registro de nuevo usuario

## Notas técnicas
- El correo se ingresa en `input[placeholder="correo@empresa.com"]`
- La contraseña se ingresa en `input[type="password"]`
- Hay un banner "Entendido" que puede aparecer al cargar — descartarlo antes de interactuar
- `autocomplete="off"` en ambos campos
- URL de login: https://dash.bord.co/login
- URL post-login esperada: https://dash.bord.co/nodi/dashboard
