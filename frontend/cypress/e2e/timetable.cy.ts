/// <reference types="cypress" />

describe('Timetable Management', () => {
  beforeEach(() => {
    cy.login('SCHOOL_ADMIN');
    cy.mockApi({
      '/classes/schedules': 'timetable.json'
    });
  });

  it('can view class timetable', () => {
    cy.visit('/timetable/class');
    cy.contains(/timetable|schedule/i).should('exist');
  });

  it('can view teacher timetable', () => {
    cy.visit('/timetable/teacher');
    cy.contains(/teacher timetable/i).should('exist');
  });
});
