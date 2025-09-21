/// <reference types="cypress" />

describe('Flujo Completo de Autenticación - Login y Logout', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('http://localhost:5173/')
  })

  describe('Flujo Completo de Autenticación', () => {
    it('debería completar todo el flujo: login -> juego -> logout -> login nuevamente', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: { success: true, message: 'Logout exitoso' }
      }).as('logoutRequest')

      cy.intercept('GET', '**/socket.io/**', {
        statusCode: 200,
        body: {}
      }).as('socketConnection')

      cy.login('koder', 'secret')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Empezar').click()
      cy.get('.game-container').should('be.visible')
      cy.get('.game-logout-button').should('be.visible')

      cy.logout()
      cy.wait('@logoutRequest')
      cy.shouldNotBeAuthenticated()

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()
    })

    it('debería manejar múltiples ciclos de login/logout correctamente', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: { success: true, message: 'Logout exitoso' }
      }).as('logoutRequest')

      for (let i = 0; i < 3; i++) {
        // Login
        cy.login('testuser', 'password123')
        cy.wait('@loginRequest')
        cy.shouldBeAuthenticated()

        cy.window().its('localStorage.auth_token').should('not.be.null')
        cy.window().its('localStorage.user_data').should('not.be.null')

        cy.logout()
        cy.wait('@logoutRequest')
        cy.shouldNotBeAuthenticated()

        cy.window().its('localStorage.auth_token').should('be.null')
        cy.window().its('localStorage.user_data').should('be.null')
      }
    })

    it('debería mantener el estado correcto después de logout con error de API', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.intercept('POST', '**/auth/logout', {
        statusCode: 500,
        body: { success: false, message: 'Error del servidor' }
      }).as('logoutRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.logout()
      cy.wait('@logoutRequest')

      cy.shouldNotBeAuthenticated()
      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')
    })
  })

  describe('Persistencia de Estado', () => {
    it('debería mantener la sesión al recargar la página', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-token')
        win.localStorage.setItem('user_data', JSON.stringify({ id: '1', username: 'testuser' }))
      })

      cy.reload()

      cy.shouldBeAuthenticated()
    })

    it('debería limpiar la sesión persistente después del logout', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: { success: true, message: 'Logout exitoso' }
      }).as('logoutRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-token')
        win.localStorage.setItem('user_data', JSON.stringify({ id: '1', username: 'testuser' }))
      })

      cy.logout()
      cy.wait('@logoutRequest')
      cy.shouldNotBeAuthenticated()

      cy.reload()

      cy.shouldNotBeAuthenticated()
    })
  })

  describe('Manejo de Errores en el Flujo Completo', () => {
    it('debería manejar errores de red durante el logout y aún así desloguear', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.intercept('POST', '**/auth/logout', {
        forceNetworkError: true
      }).as('logoutRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.logout()
      cy.wait('@logoutRequest')

      cy.shouldNotBeAuthenticated()
      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')
    })

    it('debería permitir hacer login después de un logout con error', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.intercept('POST', '**/auth/logout', {
        statusCode: 500,
        body: { success: false, message: 'Error del servidor' }
      }).as('logoutRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.logout()
      cy.wait('@logoutRequest')
      cy.shouldNotBeAuthenticated()

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()
    })
  })
})
