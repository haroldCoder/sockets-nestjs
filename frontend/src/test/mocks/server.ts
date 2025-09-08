import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configurar el servidor MSW con los handlers de mock
export const server = setupServer(...handlers)

