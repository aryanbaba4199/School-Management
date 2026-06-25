/// <reference types="cypress" />

describe('Communication Modules', () => {
  beforeEach(() => {
    cy.login('SCHOOL_ADMIN');
  });

  it('can create alerts', () => {
    cy.visit('/alerts');
    cy.contains(/alerts/i).should('exist');
  });

  it('can broadcast announcements', () => {
    cy.visit('/announcements');
    cy.contains(/announcements/i).should('exist');
  });
});
