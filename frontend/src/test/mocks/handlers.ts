import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock para login exitoso
  http.post('http://localhost:3000/auth/login', () => {
    return HttpResponse.json({
      status: 200,
      message: 'Login exitoso',
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'testuser'
      }
    })
  }),

  // Mock para login fallido
  http.post('http://localhost:3000/auth/login', ({ request }) => {
    return HttpResponse.json({
      status: 401,
      message: 'Credenciales inválidas'
    }, { status: 401 })
  }),

  // Mock para registro exitoso
  http.post('http://localhost:3000/auth/register', () => {
    return HttpResponse.json({
      success: true,
      message: 'Registro exitoso',
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'newuser'
      }
    })
  }),

  // Mock para registro fallido
  http.post('http://localhost:3000/auth/register', () => {
    return HttpResponse.json({
      success: false,
      message: 'El usuario ya existe'
    }, { status: 400 })
  }),

  // Mock para obtener usuario actual
  http.get('http://localhost:3000/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      username: 'testuser'
    })
  })
]

