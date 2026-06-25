/// <reference types="cypress" />

describe('AI & Learning Modules', () => {
  beforeEach(() => {
    cy.login('STUDENT');
  });

  it('can navigate to learning videos', () => {
    cy.visit('/learning/videos');
    cy.contains(/videos|learning/i).should('exist');
  });

  it('can navigate to smart classroom', () => {
    cy.visit('/ai-learning/smart-classroom');
    cy.contains(/smart classroom/i).should('exist');
  });

  it('can use weakness detection', () => {
    cy.visit('/ai-learning/weakness-detection');
    cy.contains(/weakness detection/i).should('exist');
  });
});
