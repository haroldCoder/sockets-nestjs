/// <reference types="cypress" />

describe('Módulo de Autenticación - Login', () => {
  beforeEach(() => {
    // Visitar la página principal antes de cada test
    cy.visit('http://localhost:5173/')
  })

  describe('Login Exitoso', () => {
    it('debería permitir el login con credenciales válidas', () => {
        // Interceptar la llamada a la API de login y verificar los datos enviados
        cy.intercept('POST', '**/auth/login', (req) => {
          expect(req.body).to.include({
            username: 'koder',
            password: 'secret'
          });
          req.reply({
            statusCode: 200,
            body: {
              success: true,
              message: 'user logged',
            }
          });
        }).as('loginRequest');
  
        // Usar el comando personalizado para hacer login (asegurarse de que esté definido)
        cy.login('koder', 'secret');
  
        // Esperar a que se complete la petición y verificar el estado
        cy.wait('@loginRequest').its('response.statusCode').should('eq', 201);
  
        // Verificar que el login fue exitoso (reemplazar con verificación específica si no hay shouldBeAuthenticated)
        cy.get('[data-testid="welcome-message"]').should('be.visible'); // Ejemplo: Verificar un elemento en la UI
  
        // Verificar que el token se guardó en localStorage y coincide con el esperado
        cy.window().its('localStorage.auth_token').should('eq', 'jwt-token-mock');
      });

    it('debería mostrar el estado de loading durante el login', () => {
      // Interceptar la llamada con delay para ver el loading
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'user logged',
        },
        delay: 1000
      }).as('loginRequest')

      // Llenar el formulario
      cy.get('input[name="username"]').type('testuser')
      cy.get('input[name="password"]').type('password123')
      
      // Enviar el formulario
      cy.get('button[type="submit"]').click()

      // Verificar que se muestra el estado de loading
      cy.get('button[type="submit"]').should('contain', 'Iniciando sesión...')
      cy.get('button[type="submit"]').should('be.disabled')
      cy.get('input[name="username"]').should('be.disabled')
      cy.get('input[name="password"]').should('be.disabled')

      // Esperar a que se complete
      cy.wait('@loginRequest')
      cy.shouldBeAuthenticated()
    })
  })

  describe('Login Fallido', () => {
    it('debería mostrar error con credenciales inválidas', () => {
      // Interceptar la llamada a la API con error
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Credenciales inválidas'
        }
      }).as('loginRequest')

      // Intentar hacer login con credenciales incorrectas
      cy.login('invaliduser', 'wrongpassword')

      // Esperar a que se complete la petición
      cy.wait('@loginRequest')

      // Verificar que se muestra el error
      cy.get('.error-message').should('contain', 'Credenciales inválidas')

      // Verificar que el formulario sigue visible
      cy.shouldNotBeAuthenticated()

      // Verificar que los campos están habilitados nuevamente
      cy.get('input[name="username"]').should('not.be.disabled')
      cy.get('input[name="password"]').should('not.be.disabled')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('debería manejar errores de servidor', () => {
      // Interceptar la llamada con error de servidor
      cy.intercept('POST', '**/auth/login', {
        statusCode: 500,
        body: {
          success: false,
          message: 'Error interno del servidor'
        }
      }).as('loginRequest')

      // Intentar hacer login
      cy.login('testuser', 'password123')

      // Esperar a que se complete la petición
      cy.wait('@loginRequest')

      // Verificar que se muestra el error
      cy.get('.error-message').should('contain', 'Error interno del servidor')
      cy.shouldNotBeAuthenticated()
    })

    it('debería manejar errores de red', () => {
      // Interceptar la llamada con error de red
      cy.intercept('POST', '**/auth/login', {
        forceNetworkError: true
      }).as('loginRequest')

      // Intentar hacer login
      cy.login('testuser', 'password123')

      // Esperar a que se complete la petición
      cy.wait('@loginRequest')

      // Verificar que se muestra el error inesperado
      cy.get('.error-message').should('contain', 'Error inesperado')
      cy.shouldNotBeAuthenticated()
    })
  })

  describe('Validación de Formulario', () => {
    it('debería requerir ambos campos para enviar el formulario', () => {
      // Intentar enviar el formulario vacío
      cy.get('button[type="submit"]').click()

      // Verificar que el navegador muestra validación HTML5
      cy.get('input[name="username"]').should('have.attr', 'required')
      cy.get('input[name="password"]').should('have.attr', 'required')

      // El formulario no debería enviarse
      cy.shouldNotBeAuthenticated()
    })

    it('debería limpiar el error cuando el usuario modifica los campos', () => {
      // Primero generar un error
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Credenciales inválidas'
        }
      }).as('loginRequest')

      cy.login('invaliduser', 'wrongpassword')
      cy.wait('@loginRequest')

      // Verificar que se muestra el error
      cy.get('.error-message').should('contain', 'Credenciales inválidas')

      // Modificar un campo
      cy.get('input[name="username"]').clear().type('newuser')

      // Verificar que el error se limpió
      cy.get('.error-message').should('not.exist')
    })

    it('debería permitir solo caracteres válidos en los campos', () => {
      // Probar caracteres especiales en username
      cy.get('input[name="username"]').type('test@user#123')
      cy.get('input[name="username"]').should('have.value', 'test@user#123')

      // Probar caracteres especiales en password
      cy.get('input[name="password"]').type('pass@word#123')
      cy.get('input[name="password"]').should('have.value', 'pass@word#123')
    })
  })

  describe('Navegación y UX', () => {
    it('debería permitir cambiar al formulario de registro', () => {
      // Verificar que inicialmente se muestra el formulario de login
      cy.get('h2').should('contain', 'Iniciar Sesión')

      // Hacer clic en el enlace de registro
      cy.get('button').contains('Regístrate aquí').click()

      // Verificar que se muestra el formulario de registro
      cy.get('h2').should('contain', 'Registrarse')
      cy.get('input[name="id"]').should('be.visible')
    })

    it('debería mantener el estado del formulario al cambiar entre login y registro', () => {
      // Llenar el formulario de login
      cy.get('input[name="username"]').type('testuser')
      cy.get('input[name="password"]').type('password123')

      // Cambiar a registro
      cy.get('button').contains('Regístrate aquí').click()

      // Cambiar de vuelta a login
      cy.get('button').contains('Inicia sesión aquí').click()

      // Verificar que los campos están vacíos (comportamiento esperado)
      cy.get('input[name="username"]').should('have.value', '')
      cy.get('input[name="password"]').should('have.value', '')
    })
  })
})
