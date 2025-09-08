import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Establecer el servidor MSW antes de todas las pruebas
beforeAll(() => server.listen())

// Restablecer cualquier request handler que podamos agregar durante las pruebas
afterEach(() => server.resetHandlers())

// Limpiar después de que todas las pruebas terminen
afterAll(() => server.close())

