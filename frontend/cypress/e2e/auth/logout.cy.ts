/// <reference types="cypress" />

describe('Módulo de Autenticación - Logout', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  describe('Logout Exitoso', () => {
    it('debería permitir el logout desde el AuthContainer', () => {
      cy.intercept('POST', 'http://localhost:3000/auth/logout', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Logout exitoso'
        }
      }).as('logoutRequest')

      cy.intercept('POST', 'http://localhost:3000/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        }
      }).as('loginRequest')

      cy.login('koder', 'secret')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Cerrar Sesión').click()

      cy.wait('@logoutRequest').its('response.statusCode').should('eq', 200)

      cy.shouldNotBeAuthenticated()

      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')
    })

    it('debería permitir el logout desde el LogoutButton en el juego', () => {
      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Logout exitoso'
        }
      }).as('logoutRequest')

      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        }
      }).as('loginRequest')

      cy.intercept('GET', '**/socket.io/**', {
        statusCode: 200,
        body: {}
      }).as('socketConnection')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Empezar').click()

      cy.get('.game-logout-button').should('be.visible')
      cy.get('.game-logout-button').should('have.attr', 'title', 'Cerrar Sesión')

      cy.get('.game-logout-button').click()

      cy.wait('@logoutRequest').its('response.statusCode').should('eq', 200)

      cy.shouldNotBeAuthenticated()

      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')
    })

    it('debería manejar el logout exitoso incluso si la API falla', () => {
      cy.intercept('POST', '**/auth/logout', {
        statusCode: 500,
        body: {
          success: false,
          message: 'Error del servidor'
        }
      }).as('logoutRequest')

      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        }
      }).as('loginRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Cerrar Sesión').click()

      cy.wait('@logoutRequest')

      cy.shouldNotBeAuthenticated()

      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')
    })
  })

  describe('Logout con Errores de Red', () => {
    it('debería manejar errores de red durante el logout', () => {
      cy.intercept('POST', '**/auth/logout', {
        forceNetworkError: true
      }).as('logoutRequest')

      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        }
      }).as('loginRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Cerrar Sesión').click()

      cy.wait('@logoutRequest')

      cy.shouldNotBeAuthenticated()

      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')
    })
  })

  describe('UI y UX del Logout', () => {
    it('debería mostrar el ícono correcto en el botón de logout del juego', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        }
      }).as('loginRequest')

      cy.intercept('GET', '**/socket.io/**', {
        statusCode: 200,
        body: {}
      }).as('socketConnection')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Empezar').click()

      cy.get('.game-logout-button svg').should('be.visible')
      cy.get('.game-logout-button svg').should('have.class', 'logout-icon')
      cy.get('.game-logout-button svg path').should('exist')
    })

    it('debería tener el atributo title correcto en el botón de logout', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        }
      }).as('loginRequest')

      cy.intercept('GET', '**/socket.io/**', {
        statusCode: 200,
        body: {}
      }).as('socketConnection')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Empezar').click()

      cy.get('.game-logout-button').should('have.attr', 'title', 'Cerrar Sesión')
    })

    it('debería mantener la funcionalidad después de múltiples logins y logouts', () => {
      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: { success: true, message: 'Logout exitoso' }
      }).as('logoutRequest')

      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Cerrar Sesión').click()
      cy.wait('@logoutRequest')
      cy.shouldNotBeAuthenticated()

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Cerrar Sesión').click()
      cy.wait('@logoutRequest')
      cy.shouldNotBeAuthenticated()
    })
  })

  describe('Estado de la Aplicación después del Logout', () => {
    it('debería limpiar completamente el estado de Redux después del logout', () => {
      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: { success: true, message: 'Logout exitoso' }
      }).as('logoutRequest')

      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.window().its('localStorage.auth_token').should('not.be.null')
      cy.window().its('localStorage.user_data').should('not.be.null')

      cy.get('button').contains('Cerrar Sesión').click()
      cy.wait('@logoutRequest')

      cy.window().its('localStorage.auth_token').should('be.null')
      cy.window().its('localStorage.user_data').should('be.null')

      cy.shouldNotBeAuthenticated()
    })

    it('debería permitir hacer login nuevamente después del logout', () => {
      cy.intercept('POST', '**/auth/logout', {
        statusCode: 200,
        body: { success: true, message: 'Logout exitoso' }
      }).as('logoutRequest')

      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { success: true, message: 'user logged' }
      }).as('loginRequest')

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()

      cy.get('button').contains('Cerrar Sesión').click()
      cy.wait('@logoutRequest')
      cy.shouldNotBeAuthenticated()

      cy.login('testuser', 'password123')
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()
    })
  })
})
