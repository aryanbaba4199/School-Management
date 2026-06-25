/// <reference types="cypress" />

describe('Homework Management', () => {
  beforeEach(() => {
    cy.login('TEACHER');
    cy.mockApi({
      '/homework': 'homework_list.json'
    });
  });

  it('can view assignments', () => {
    cy.visit('/homework');
    cy.url().should('include', '/homework');
    cy.contains(/homework|assignments/i).should('exist');
  });

  it('can open create homework modal', () => {
    cy.visit('/homework');
    cy.get('button').contains(/create|add/i).click();
    cy.get('form').should('be.visible');
  });

  describe('Student View', () => {
    beforeEach(() => {
      cy.login('STUDENT');
      cy.mockApi({
        '/homework/student/dashboard': 'student_homework.json'
      });
    });

    it('can view pending homework', () => {
      cy.visit('/homework');
      cy.contains(/homework|dashboard/i).should('exist');
      // Submissions button or upload area
      cy.get('button').contains(/submit|upload/i).should('exist');
    });
  });
});
