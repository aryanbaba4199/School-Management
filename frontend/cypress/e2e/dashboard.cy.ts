/// <reference types="cypress" />

describe('Dashboard Page', () => {
  beforeEach(() => {
    // We login as a SUPER_ADMIN using our custom command
    cy.login('SUPER_ADMIN');
    
    // Mock the dashboard stats endpoints if applicable
    cy.mockApi({
      '/dashboard/stats': 'dashboard_stats.json'
    });
  });

  it('successfully loads the dashboard for an admin', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    
    // Verify standard layout components
    cy.get('header').should('exist');
    cy.get('nav').should('exist');
    
    // The specific locators depend on the actual UI, checking for generic dashboard keywords
    cy.contains(/dashboard|overview/i).should('be.visible');
  });

  it('renders correctly for a student', () => {
    // Login as student
    cy.login('STUDENT');
    cy.visit('/dashboard');
    
    // Students should see their specific dashboard
    cy.contains(/dashboard|overview/i).should('be.visible');
    
    // Students typically shouldn't see 'Manage Schools' or 'Users' in the nav
    cy.contains(/manage schools|school settings/i).should('not.exist');
  });
});
