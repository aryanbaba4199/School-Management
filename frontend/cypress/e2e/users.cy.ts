/// <reference types="cypress" />

describe('Users Management', () => {
  beforeEach(() => {
    // We login as a SCHOOL_ADMIN to manage users
    cy.login('SCHOOL_ADMIN');
    
    // Mock the endpoints
    cy.mockApi({
      '/users': 'users_list.json',
      '/users/teachers': 'teachers_list.json'
    });
  });

  it('can navigate to the Teachers list', () => {
    cy.visit('/users/teachers');
    cy.url().should('include', '/users/teachers');
    cy.contains(/teachers/i).should('be.visible');
    
    // Typically there is an Add Teacher button
    cy.get('button').contains(/add|create/i).should('exist');
  });

  it('can open the create user modal/form', () => {
    cy.visit('/users/teachers');
    cy.get('button').contains(/add|create/i).click();
    
    // Check if form is displayed
    cy.get('form').should('be.visible');
    cy.get('input[name="name"], input[placeholder*="Name"]').should('exist');
    cy.get('input[name="email"], input[placeholder*="Email"]').should('exist');
  });

  it('handles bulk import UI', () => {
    cy.visit('/users/students');
    // Assuming there is a bulk import button
    cy.get('button').contains(/import/i).click();
    
    // Import modal should have a file input
    cy.get('input[type="file"]').should('exist');
  });
});
