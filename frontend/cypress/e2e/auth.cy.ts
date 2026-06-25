/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear local storage to ensure a clean state
    cy.clearLocalStorage();
    
    // Mock the login API to avoid hitting the actual backend
    cy.intercept('POST', '**/api/users/login', (req) => {
      const { username, password } = req.body;
      
      // Simple mock logic
      if (password === 'password123') {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: {
              token: 'fake-jwt-token-for-testing',
              user: {
                _id: 'u_1',
                name: 'Test User',
                email: username,
                role: { name: 'SUPER_ADMIN', access: [] },
                isActive: true
              }
            }
          }
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            success: false,
            message: 'Invalid credentials'
          }
        });
      }
    }).as('loginRequest');
  });

  it('successfully loads the login page', () => {
    cy.visit('/login');
    cy.get('form').should('exist');
    cy.contains(/login|sign in/i).should('exist');
  });

  it('shows error on invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="username"], input[type="email"], input[placeholder*="Email"]').type('wrong@email.com');
    cy.get('input[name="password"], input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.contains(/invalid|error|failed/i).should('be.visible');
  });

  it('logs in successfully and redirects to dashboard', () => {
    cy.visit('/login');
    cy.get('input[name="username"], input[type="email"], input[placeholder*="Email"]').type('admin@school.com');
    cy.get('input[name="password"], input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Local storage should contain auth token
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('exist');
  });
});
