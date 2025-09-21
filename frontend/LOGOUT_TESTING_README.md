# Pruebas de Logout - Documentación

Este documento describe las pruebas implementadas para la funcionalidad de logout en la aplicación.

## Estructura de Pruebas

### Pruebas Unitarias

#### 1. LogoutButton Component (`src/components/__tests__/LogoutButton.test.tsx`)
- **Propósito**: Probar el componente LogoutButton de forma aislada
- **Cobertura**:
  - Renderizado correcto del botón
  - Aplicación de clases CSS personalizadas
  - Manejo de eventos de clic
  - Integración con Redux (dispatch de logoutUser)
  - Manejo de errores de API
  - Verificación de atributos (title, className)

#### 2. LogoutUseCase (`src/auth/application/__tests__/logout.use-case.test.ts`)
- **Propósito**: Probar la lógica de negocio del logout
- **Cobertura**:
  - Llamada correcta al repositorio
  - Manejo de errores sin lanzar excepciones
  - Logging de errores en consola

#### 3. AuthSlice (`src/redux/__tests__/authSlice.test.ts`)
- **Propósito**: Probar las acciones de Redux relacionadas con logout
- **Cobertura**:
  - Acción `logoutUser` resetea el estado correctamente
  - Inmutabilidad del estado
  - Limpieza de errores previos
  - Funcionamiento desde diferentes estados iniciales

### Pruebas de Integración (Cypress)

#### 1. Logout Básico (`cypress/e2e/auth/logout.cy.ts`)
- **Propósito**: Probar el flujo de logout desde diferentes contextos
- **Cobertura**:
  - Logout desde AuthContainer
  - Logout desde LogoutButton en el juego
  - Manejo de errores de API y red
  - Verificación de limpieza de localStorage
  - Verificación de UI (íconos, atributos, etc.)

#### 2. Flujo Completo (`cypress/e2e/auth/logout-integration.cy.ts`)
- **Propósito**: Probar el flujo completo de autenticación
- **Cobertura**:
  - Ciclos completos de login → logout → login
  - Persistencia de estado
  - Múltiples ciclos de autenticación
  - Manejo de errores en flujos completos

## Comandos de Ejecución

### Pruebas Unitarias (Vitest)

```bash
# Ejecutar todas las pruebas unitarias
npm run test

# Ejecutar solo las pruebas de logout
npm run test -- --grep "logout"

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar con UI
npm run test:ui
```

### Pruebas de Integración (Cypress)

```bash
# Ejecutar todas las pruebas de Cypress
npm run cypress:run

# Abrir Cypress en modo interactivo
npm run cypress:open

# Ejecutar solo las pruebas de logout
npm run cypress:run -- --spec "cypress/e2e/auth/logout*.cy.ts"

# Ejecutar en modo headless
npm run cypress:run:headless
```

## Configuración Requerida

### Variables de Entorno
Asegúrate de tener configuradas las siguientes variables:

```env
VITE_APP_SERVER=http://localhost:3000
```

### Servidor de Desarrollo
Para las pruebas de Cypress, necesitas tener el servidor de desarrollo ejecutándose:

```bash
# Terminal 1: Servidor backend
cd backend
npm run start:dev

# Terminal 2: Servidor frontend
cd frontend
npm run dev

# Terminal 3: Ejecutar Cypress
npm run cypress:open
```

## Cobertura de Pruebas

### Casos de Prueba Cubiertos

#### Casos Exitosos
- ✅ Logout exitoso desde AuthContainer
- ✅ Logout exitoso desde LogoutButton en el juego
- ✅ Limpieza correcta del estado de Redux
- ✅ Limpieza correcta del localStorage
- ✅ Redirección al formulario de login
- ✅ Múltiples ciclos de login/logout

#### Casos de Error
- ✅ Logout con error de API (500)
- ✅ Logout con error de red
- ✅ Logout con error de servidor
- ✅ Manejo de errores sin afectar la funcionalidad

#### Casos de UI/UX
- ✅ Renderizado correcto del botón
- ✅ Aplicación de clases CSS
- ✅ Atributos correctos (title, className)
- ✅ Ícono SVG correcto
- ✅ Estado de loading (si aplica)

## Estructura de Archivos

```
frontend/
├── src/
│   ├── components/
│   │   ├── __tests__/
│   │   │   └── LogoutButton.test.tsx
│   │   └── LogoutButton.tsx
│   ├── redux/
│   │   ├── __tests__/
│   │   │   └── authSlice.test.ts
│   │   └── authSlice.ts
│   └── auth/
│       └── application/
│           └── __tests__/
│               └── logout.use-case.test.ts
├── cypress/
│   ├── e2e/
│   │   └── auth/
│   │       ├── logout.cy.ts
│   │       └── logout-integration.cy.ts
│   └── support/
│       └── commands.ts
└── LOGOUT_TESTING_README.md
```

## Notas Importantes

1. **Mocking**: Las pruebas unitarias usan mocks para el ApiClient y localStorage
2. **Redux Store**: Se configura un store de Redux para las pruebas del componente
3. **Interceptors**: Las pruebas de Cypress usan interceptors para simular respuestas de API
4. **Cleanup**: Se limpia el localStorage antes de cada prueba de Cypress
5. **Timeouts**: Las pruebas de Cypress tienen timeouts configurados para manejar operaciones asíncronas

## Mejoras Futuras

- [ ] Agregar pruebas de accesibilidad para el botón de logout
- [ ] Implementar pruebas de rendimiento para múltiples ciclos de logout
- [ ] Agregar pruebas de internacionalización si se implementa
- [ ] Crear pruebas de regresión visual con Cypress
