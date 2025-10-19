# Tests de Cypress - Módulo de Autenticación

Este directorio contiene los tests end-to-end (E2E) para el módulo de autenticación usando Cypress.

## Estructura

```
cypress/
├── e2e/
│   └── auth/
│       └── login.cy.ts          # Tests principales de login
├── fixtures/
│   └── auth.json                # Datos de prueba para autenticación
├── support/
│   ├── commands.ts              # Comandos personalizados de Cypress
│   └── e2e.ts                   # Configuración global
└── README.md                    # Este archivo
```

## Tests Implementados

### Login Tests (`login.cy.ts`)

Los tests cubren los casos más importantes del flujo de login:

#### ✅ Login Exitoso
- **Login con credenciales válidas**: Verifica que el usuario puede autenticarse correctamente
- **Estado de loading**: Verifica que se muestra el estado de carga durante el proceso

#### ❌ Login Fallido
- **Credenciales inválidas**: Verifica el manejo de errores con credenciales incorrectas
- **Errores de servidor**: Manejo de errores 500 del servidor
- **Errores de red**: Manejo de fallos de conectividad

#### 📝 Validación de Formulario
- **Campos requeridos**: Verifica que ambos campos son obligatorios
- **Limpieza de errores**: Verifica que los errores se limpian al modificar campos
- **Caracteres válidos**: Permite caracteres especiales en los campos

#### 🧭 Navegación y UX
- **Cambio a registro**: Verifica la navegación entre formularios
- **Estado del formulario**: Verifica el comportamiento al cambiar entre vistas

#### 💾 Persistencia de Sesión
- **Mantenimiento de sesión**: Verifica que la sesión persiste al recargar
- **Logout**: Verifica el cierre de sesión correcto

## Comandos Personalizados

Se han creado comandos personalizados para facilitar los tests:

- `cy.login(username, password)`: Realiza login con las credenciales proporcionadas
- `cy.shouldBeAuthenticated()`: Verifica que el usuario está autenticado
- `cy.shouldNotBeAuthenticated()`: Verifica que el usuario NO está autenticado

## Cómo Ejecutar los Tests

### Modo Interactivo (Recomendado para desarrollo)
```bash
npm run e2e:open
```

### Modo Headless (Para CI/CD)
```bash
npm run e2e
```

### Solo Cypress (comandos directos)
```bash
# Abrir Cypress
npm run cypress:open

# Ejecutar todos los tests
npm run cypress:run

# Ejecutar en modo headless
npm run cypress:run:headless
```

## Configuración

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Viewport**: 1280x720
- **Timeouts**: 10 segundos para comandos, requests y responses
- **Videos**: Deshabilitados (configurable)
- **Screenshots**: Habilitados en fallos

## Fixtures

El archivo `auth.json` contiene datos de prueba para diferentes escenarios:

- `validUser`: Credenciales válidas para tests exitosos
- `invalidUser`: Credenciales inválidas para tests de error
- `emptyCredentials`: Campos vacíos para validación
- `partialCredentials`: Credenciales parciales

## Interceptación de APIs

Los tests utilizan `cy.intercept()` para mockear las llamadas a la API:

- **Login exitoso**: Mock de respuesta 200 con token
- **Login fallido**: Mock de respuesta 401 con error
- **Errores de servidor**: Mock de respuesta 500
- **Errores de red**: Mock de fallo de red

## Mejores Prácticas Implementadas

1. **Limpieza de estado**: Cada test comienza con localStorage y cookies limpios
2. **Comandos reutilizables**: Comandos personalizados para operaciones comunes
3. **Interceptación de APIs**: Control total sobre las respuestas del servidor
4. **Verificaciones robustas**: Múltiples verificaciones para cada escenario
5. **Datos de prueba organizados**: Fixtures para diferentes escenarios

## Próximos Pasos

Para expandir la cobertura de tests, se pueden agregar:

- Tests de registro de usuarios
- Tests de recuperación de contraseña
- Tests de autenticación con diferentes roles
- Tests de seguridad (XSS, CSRF)
- Tests de rendimiento del login
