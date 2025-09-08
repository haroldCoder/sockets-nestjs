# Frontend - Sockets NestJS

Aplicación frontend desarrollada con React + TypeScript + Vite que incluye un módulo de autenticación completo con tests unitarios, de integración y end-to-end.

## 🚀 Características

- **React 18** con TypeScript
- **Vite** como bundler y dev server
- **Redux Toolkit** para manejo de estado
- **Socket.io** para comunicación en tiempo real
- **Tests completos** con Vitest y Cypress
- **Módulo de autenticación** con arquitectura limpia

## 🧪 Testing

### Tests Unitarios e Integración (Vitest)
```bash
# Ejecutar todos los tests
npm run test

# Ejecutar con interfaz visual
npm run test:ui

# Ejecutar con cobertura
npm run test:coverage
```

### Tests End-to-End (Cypress)
```bash
# Abrir Cypress en modo interactivo
npm run e2e:open

# Ejecutar tests en modo headless
npm run e2e

# Ejecutar con script personalizado
./cypress/scripts/run-tests.sh open
```

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── application/         # Casos de uso
│   ├── domain/             # Entidades y repositorios
│   ├── infrastructure/     # Cliente API
│   └── presentation/       # Componentes React
├── redux/                  # Estado global
└── config/                 # Configuraciones

cypress/                    # Tests E2E
├── e2e/auth/              # Tests de autenticación
├── fixtures/              # Datos de prueba
└── support/               # Comandos personalizados
```

## 🔐 Módulo de Autenticación

El módulo de autenticación incluye:

- **Login/Logout** con manejo de tokens
- **Registro de usuarios**
- **Persistencia de sesión**
- **Manejo de errores** robusto
- **Tests completos** (unitarios, integración y E2E)

### Tests de Login (Cypress)

Los tests E2E cubren los casos más importantes:

- ✅ Login exitoso con credenciales válidas
- ❌ Manejo de errores con credenciales inválidas
- ⏳ Estados de loading durante el proceso
- 📝 Validación de formularios
- 💾 Persistencia de sesión
- 🚪 Logout correcto

## 🛠️ Desarrollo

### Instalación
```bash
npm install
```

### Servidor de desarrollo
```bash
npm run dev
```

### Build para producción
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
