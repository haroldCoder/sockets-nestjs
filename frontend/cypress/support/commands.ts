/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Comando personalizado para hacer login con credenciales
       * @param username - Nombre de usuario
       * @param password - Contraseña
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Comando personalizado para verificar que el usuario está autenticado
       */
      shouldBeAuthenticated(): Chainable<void>
      
      /**
       * Comando personalizado para verificar que el usuario NO está autenticado
       */
      shouldNotBeAuthenticated(): Chainable<void>
    }
  }
}

// Comando personalizado para hacer login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/')
  
  // Esperar a que se cargue el formulario de login
  cy.get('h2').should('contain', 'Iniciar Sesión')
  
  // Llenar el formulario
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password)
  
  // Enviar el formulario
  cy.get('button[type="submit"]').click()
})

// Comando para verificar autenticación exitosa
Cypress.Commands.add('shouldBeAuthenticated', () => {
  cy.get('h3').should('contain', '¡Bienvenido!')
  cy.get('p').should('contain', 'Usuario autenticado correctamente')
  cy.get('button').should('contain', 'Cerrar Sesión')
})

// Comando para verificar que NO está autenticado
Cypress.Commands.add('shouldNotBeAuthenticated', () => {
  cy.get('h2').should('contain', 'Iniciar Sesión')
  cy.get('input[name="username"]').should('be.visible')
  cy.get('input[name="password"]').should('be.visible')
})
