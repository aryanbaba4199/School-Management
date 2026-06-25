/// <reference types="cypress" />

describe('Fees & Transactions', () => {
  beforeEach(() => {
    cy.login('SCHOOL_ADMIN');
    cy.mockApi({
      '/fees': 'fees_list.json',
      '/payments': 'payments_list.json'
    });
  });

  it('can manage fee invoices', () => {
    cy.visit('/fees');
    cy.url().should('include', '/fees');
    cy.contains(/generate fees/i).should('exist');
  });

  it('can process transactions', () => {
    cy.visit('/transactions');
    cy.contains(/transactions/i).should('exist');
  });
});
