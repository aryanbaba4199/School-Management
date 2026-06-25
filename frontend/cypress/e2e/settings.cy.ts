/// <reference types="cypress" />

describe('Settings & App Management', () => {
  beforeEach(() => {
    cy.login('SUPER_ADMIN');
  });

  it('can manage subscription plans', () => {
    cy.visit('/plans');
    cy.url().should('include', '/plans');
    cy.contains(/subscription|plans/i).should('exist');
  });

  it('can view global settings', () => {
    cy.visit('/settings/global');
    cy.contains(/global settings/i).should('exist');
  });
});
