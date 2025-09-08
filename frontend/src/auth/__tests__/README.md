# Pruebas Unitarias del Módulo Auth

Este directorio contiene todas las pruebas unitarias para el módulo de autenticación del frontend.

## Estructura de Pruebas

### 1. Pruebas de Dominio (`domain/`)
- **`entities.test.ts`**: Pruebas para las entidades del dominio (User, AuthResult, AuthState, etc.)
- Verifica la estructura y consistencia de tipos de las entidades
- Valida diferentes estados y configuraciones de las entidades

### 2. Pruebas de Casos de Uso (`application/__tests__/`)
- **`login.use-case.test.ts`**: Pruebas para el caso de uso de login
- **`register.use-case.test.ts`**: Pruebas para el caso de uso de registro
- **`logout.use-case.test.ts`**: Pruebas para el caso de uso de logout
- Verifica la lógica de negocio y validaciones
- Prueba el manejo de errores y casos edge

### 3. Pruebas de Infraestructura (`infrastructure/__tests__/`)
- **`api-client.test.ts`**: Pruebas para el cliente de API
- Verifica las llamadas HTTP y manejo de respuestas
- Prueba el manejo de tokens y localStorage
- Valida interceptors de axios

### 4. Pruebas de Componentes (`presentation/__tests__/`)
- **`login-form.test.tsx`**: Pruebas para el formulario de login
- **`register-form.test.tsx`**: Pruebas para el formulario de registro
- **`auth-container.test.tsx`**: Pruebas para el contenedor de autenticación
- Verifica la interacción del usuario con los componentes
- Prueba el estado de loading, errores y navegación

### 5. Pruebas de Integración (`integration/`)
- **`auth-flow.test.tsx`**: Pruebas de flujo completo de autenticación
- Verifica el flujo completo desde login/registro hasta logout
- Prueba la integración entre componentes, casos de uso y API
- Valida la persistencia de estado y localStorage

## Configuración de Testing

### Librerías Utilizadas
- **Vitest**: Framework de testing principal
- **React Testing Library**: Para pruebas de componentes React
- **MSW (Mock Service Worker)**: Para mockear llamadas HTTP
- **@testing-library/user-event**: Para simular interacciones del usuario

### Configuración
- **`vitest.config.ts`**: Configuración principal de Vitest
- **`src/test/setup.ts`**: Configuración global de pruebas
- **`src/test/mocks/`**: Mocks para servicios externos
- **`src/test/utils/`**: Utilidades de testing personalizadas

## Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test -- --watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas con interfaz gráfica
npm run test:ui
```

## Cobertura de Pruebas

Las pruebas cubren:

### ✅ Casos de Uso
- Validaciones de entrada
- Lógica de negocio
- Manejo de errores
- Integración con repositorios

### ✅ Componentes React
- Renderizado correcto
- Interacciones del usuario
- Estados de loading y error
- Navegación entre formularios

### ✅ Infraestructura
- Llamadas HTTP
- Manejo de tokens
- Interceptors de axios
- localStorage

### ✅ Flujos de Integración
- Login completo
- Registro completo
- Logout
- Inicialización de autenticación

## Mejores Prácticas

1. **Aislamiento**: Cada prueba es independiente y no afecta a otras
2. **Mocks**: Se utilizan mocks para dependencias externas
3. **Datos de Prueba**: Se usan datos consistentes y predecibles
4. **Nombres Descriptivos**: Los nombres de las pruebas describen claramente qué se está probando
5. **Cobertura Completa**: Se prueban casos exitosos, fallidos y edge cases

## Estructura de Archivos

```
src/auth/__tests__/
├── README.md
├── integration/
│   └── auth-flow.test.tsx
├── domain/
│   └── __tests__/
│       └── entities.test.ts
├── application/
│   └── __tests__/
│       ├── login.use-case.test.ts
│       ├── register.use-case.test.ts
│       └── logout.use-case.test.ts
├── infrastructure/
│   └── __tests__/
│       └── api-client.test.ts
└── presentation/
    └── __tests__/
        ├── login-form.test.tsx
        ├── register-form.test.tsx
        └── auth-container.test.tsx
```

