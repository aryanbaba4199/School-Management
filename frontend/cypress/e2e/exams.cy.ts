/// <reference types="cypress" />

describe('Exams Management', () => {
  beforeEach(() => {
    cy.login('TEACHER');
    cy.mockApi({
      '/exams': 'exams_list.json',
      '/exams/schedules': 'exam_schedules.json'
    });
  });

  it('can view the exam master list', () => {
    cy.visit('/exams/master');
    cy.url().should('include', '/exams');
    cy.contains(/exam master/i).should('exist');
  });

  it('can view exam results page', () => {
    cy.visit('/exams/results');
    cy.contains(/results/i).should('exist');
    cy.get('button').contains(/generate/i).should('exist');
  });
});
