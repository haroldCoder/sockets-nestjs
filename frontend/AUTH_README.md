# Sistema de Autenticación - Arquitectura Hexagonal

Este proyecto implementa un sistema de autenticación usando arquitectura hexagonal (Ports and Adapters) en el frontend de React.

## Estructura de la Arquitectura Hexagonal

```
src/auth/
├── domain/                    # Capa de Dominio
│   ├── user.entity.ts        # Entidades del dominio
│   ├── auth.entity.ts        # Entidades de autenticación
│   └── auth.repository.ts    # Interfaces (Puertos)
├── application/              # Capa de Aplicación
│   ├── login.use-case.ts     # Casos de uso
│   ├── register.use-case.ts  # Casos de uso
│   └── logout.use-case.ts    # Casos de uso
├── infrastructure/           # Capa de Infraestructura
│   └── api-client.ts         # Implementación de repositorio (Adaptador)
└── presentation/             # Capa de Presentación
    ├── login-form.tsx        # Componentes de UI
    ├── register-form.tsx     # Componentes de UI
    └── auth-container.tsx    # Contenedor principal
```

## Características Implementadas

### 🔐 Autenticación
- **Login**: Inicio de sesión con username y password
- **Registro**: Creación de nueva cuenta con validaciones
- **Logout**: Cierre de sesión seguro
- **Persistencia**: Mantiene la sesión en localStorage

### 🏗️ Arquitectura Hexagonal
- **Separación de responsabilidades**: Cada capa tiene su propósito específico
- **Inversión de dependencias**: El dominio no depende de la infraestructura
- **Testabilidad**: Fácil de testear cada capa por separado
- **Flexibilidad**: Fácil cambio de implementaciones

### 🎨 UI/UX
- **Formularios responsivos**: Diseño moderno con glassmorphism
- **Validaciones en tiempo real**: Feedback inmediato al usuario
- **Estados de carga**: Indicadores visuales durante las operaciones
- **Manejo de errores**: Mensajes claros y útiles

## Endpoints del Backend

El sistema se conecta a los siguientes endpoints:

- `POST /users/login` - Iniciar sesión
- `POST /users/register` - Registrar usuario

## Configuración

### Variables de Entorno
```env
VITE_APP_API_URL=http://localhost:3000
```

### Dependencias
- `axios`: Cliente HTTP
- `@reduxjs/toolkit`: Manejo de estado
- `react-redux`: Integración con React

## Uso

### 1. Login
```typescript
const loginUseCase = new LoginUseCase(new ApiClient());
const result = await loginUseCase.execute({
  username: 'usuario',
  password: 'contraseña'
});
```

### 2. Registro
```typescript
const registerUseCase = new RegisterUseCase(new ApiClient());
const result = await registerUseCase.execute({
  username: 'usuario',
  password: 'contraseña',
  id: 'id-unico',
  ip: '127.0.0.1'
});
```

### 3. Redux Integration
```typescript
// El estado de autenticación se maneja automáticamente
const { isAuthenticated, user } = useSelector((state: any) => state.auth);
```

## Validaciones Implementadas

### Login
- Username y password requeridos
- Username mínimo 3 caracteres
- Password mínimo 6 caracteres

### Registro
- Todos los campos requeridos
- Username mínimo 3 caracteres
- Password mínimo 6 caracteres
- Confirmación de contraseña
- ID único requerido

## Flujo de Autenticación

1. **Usuario no autenticado**: Muestra formularios de login/registro
2. **Login/Registro exitoso**: Guarda token y datos en localStorage
3. **Usuario autenticado**: Muestra el juego y permite conexión a sockets
4. **Logout**: Limpia datos y regresa al estado inicial

## Beneficios de la Arquitectura Hexagonal

- ✅ **Mantenibilidad**: Código organizado y fácil de mantener
- ✅ **Testabilidad**: Cada capa se puede testear independientemente
- ✅ **Flexibilidad**: Fácil cambio de implementaciones
- ✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
- ✅ **Separación de responsabilidades**: Cada capa tiene un propósito claro
