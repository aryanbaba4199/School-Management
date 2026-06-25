/// <reference types="cypress" />

describe('Attendance Operations', () => {
  beforeEach(() => {
    cy.login('TEACHER');
    cy.mockApi({
      '/attendance/student': 'student_attendance.json',
      '/attendance/teacher': 'teacher_attendance.json'
    });
  });

  it('can view and mark student attendance', () => {
    cy.visit('/attendance/student');
    cy.contains(/attendance/i).should('exist');
    
    // There should be a grid or list to toggle attendance
    cy.get('button').contains(/present|absent/i).should('exist');
  });
});
